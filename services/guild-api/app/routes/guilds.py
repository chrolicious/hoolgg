"""Guild management routes - create, configure, view guilds"""

from flask import Blueprint, request, jsonify, current_app
from app.models import get_db
from app.models.guild import Guild
from app.models.guild_permission import GuildPermission
from app.models.guild_member import GuildMember
from app.services.jwt_service import verify_token
from app.middleware.permissions import check_permission_cached
from datetime import datetime, timezone

bp = Blueprint("guilds", __name__, url_prefix="/guilds")


def get_current_user():
    """Extract current user from JWT token in cookie"""
    access_token = request.cookies.get("access_token")
    if not access_token:
        return None

    payload = verify_token(access_token, token_type="access")
    if not payload:
        return None

    return payload.get("bnet_id")


def check_user_rank(bnet_id: int, guild_id: int = None) -> dict:
    """
    Check user's rank in a guild or any guild

    Returns: {"allowed": bool, "rank_id": int, "character_name": str}
    """
    db = next(get_db())

    try:
        if guild_id:
            # Check rank in specific guild
            member = (
                db.query(GuildMember)
                .filter(
                    GuildMember.bnet_id == bnet_id, GuildMember.guild_id == guild_id
                )
                .first()
            )
        else:
            # Find highest rank across all guilds
            member = (
                db.query(GuildMember)
                .filter(GuildMember.bnet_id == bnet_id)
                .order_by(GuildMember.rank_id.asc())
                .first()
            )

        if member:
            return {
                "allowed": member.rank_id <= 1,  # Officer or GM
                "rank_id": member.rank_id,
                "character_name": member.character_name,
            }

        return {"allowed": False, "rank_id": None, "character_name": None}

    finally:
        db.close()


@bp.route("", methods=["GET"])
def list_guilds():
    """
    List all guilds the current user is a member of

    Returns a list of guilds with basic info and user's rank.
    """
    bnet_id = get_current_user()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = next(get_db())

    try:
        # Get all guilds user is a member of
        # Only return one member per guild (use dictionary to deduplicate)
        memberships = (
            db.query(GuildMember, Guild)
            .join(Guild, GuildMember.guild_id == Guild.id)
            .filter(GuildMember.bnet_id == bnet_id, Guild.deleted_at == None)
            .order_by(Guild.id, GuildMember.rank_id.asc())  # Order by rank to get highest first
            .all()
        )

        # Deduplicate by guild_id, keeping the first (highest rank) per guild
        guilds_dict = {}
        for member, guild in memberships:
            if guild.id not in guilds_dict:
                guild_data = guild.to_dict()
                guild_data["user_rank"] = {
                    "rank_id": member.rank_id,
                    "rank_name": member.rank_name,
                    "character_name": member.character_name,
                }
                guilds_dict[guild.id] = guild_data

        return jsonify({"guilds": list(guilds_dict.values())}), 200

    finally:
        db.close()


@bp.route("", methods=["POST"])
def create_guild():
    """
    Create a new guild instance

    Request body:
    {
        "name": "Guild Name",
        "realm": "area-52"
    }

    In production: Only Officers (rank_id <= 1) can create guilds.
    In development: Anyone can create their first guild.
    """
    bnet_id = get_current_user()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    # In production, check if user is Officer or GM in any guild
    # In development, allow anyone to create their first guild
    if not current_app.config.get("DEBUG"):
        rank_check = check_user_rank(bnet_id)
        if not rank_check["allowed"]:
            return (
                jsonify(
                    {"error": "Only Officers or Guild Masters can create guild instances"}
                ),
                403,
            )

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    guild_name = data.get("name")
    realm = data.get("realm")

    if not guild_name or not realm:
        return jsonify({"error": "name and realm are required"}), 400

    db = next(get_db())

    try:
        # Check if guild already exists
        existing = (
            db.query(Guild)
            .filter(Guild.name == guild_name, Guild.realm == realm)
            .first()
        )

        if existing:
            return (
                jsonify({"error": "Guild instance already exists for this guild"}),
                409,
            )

        # Create guild
        guild = Guild(name=guild_name, realm=realm, gm_bnet_id=bnet_id)
        db.add(guild)
        db.flush()  # Get guild.id

        # Add creator as Guild Master
        creator_member = GuildMember(
            guild_id=guild.id,
            bnet_id=bnet_id,
            character_name="GuildMaster",  # Placeholder, will be updated on sync
            rank_id=0,
            rank_name="Guild Master",
        )
        db.add(creator_member)

        # Initialize recommended default permissions (task 0.19)
        # Progress: enabled for all members (rank_id 9 = everyone)
        progress_perm = GuildPermission(
            guild_id=guild.id, tool_name="progress", min_rank_id=9, enabled=True
        )
        db.add(progress_perm)

        # Recruitment: enabled for Officers+ (rank_id <= 1)
        recruitment_perm = GuildPermission(
            guild_id=guild.id, tool_name="recruitment", min_rank_id=1, enabled=True
        )
        db.add(recruitment_perm)

        db.commit()

        current_app.logger.info(f"Guild created: {guild.id} by bnet_id={bnet_id}")

        return jsonify(guild.to_dict()), 201

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to create guild: {e}")
        return jsonify({"error": "Failed to create guild"}), 500
    finally:
        db.close()


@bp.route("/<int:guild_id>/settings", methods=["GET"])
def get_guild_settings(guild_id: int):
    """
    Get guild settings

    Returns guild configuration including name, realm, permissions, and tools.
    Only accessible by guild members.
    """
    bnet_id = get_current_user()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = next(get_db())

    try:
        # Verify user is a member of this guild
        member = (
            db.query(GuildMember)
            .filter(GuildMember.bnet_id == bnet_id, GuildMember.guild_id == guild_id)
            .first()
        )

        if not member:
            return jsonify({"error": "Not a member of this guild"}), 403

        # Fetch guild
        guild = db.query(Guild).filter(Guild.id == guild_id).first()
        if not guild or guild.deleted_at:
            return jsonify({"error": "Guild not found"}), 404

        # Fetch permissions
        permissions = (
            db.query(GuildPermission).filter(GuildPermission.guild_id == guild_id).all()
        )

        # Fetch member count
        member_count = db.query(GuildMember).filter(GuildMember.guild_id == guild_id).count()

        settings = {
            "guild": guild.to_dict(),
            "permissions": [perm.to_dict() for perm in permissions],
            "member_count": member_count,
            "user_rank": {"rank_id": member.rank_id, "rank_name": member.rank_name},
        }

        return jsonify(settings), 200

    finally:
        db.close()


@bp.route("/<int:guild_id>/settings", methods=["PUT"])
def update_guild_settings(guild_id: int):
    """
    Update guild settings (GM only)

    Request body:
    {
        "name": "Updated Guild Name",  // optional
        "realm": "updated-realm"  // optional
    }
    """
    bnet_id = get_current_user()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = next(get_db())

    try:
        # Verify user is GM of this guild
        guild = db.query(Guild).filter(Guild.id == guild_id).first()
        if not guild or guild.deleted_at:
            return jsonify({"error": "Guild not found"}), 404

        if guild.gm_bnet_id != bnet_id:
            return jsonify({"error": "Only Guild Master can update settings"}), 403

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Update allowed fields
        if "name" in data:
            guild.name = data["name"]
        if "realm" in data:
            guild.realm = data["realm"]

        db.commit()

        current_app.logger.info(f"Guild settings updated: {guild_id} by bnet_id={bnet_id}")

        return jsonify(guild.to_dict()), 200

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to update guild settings: {e}")
        return jsonify({"error": "Failed to update settings"}), 500
    finally:
        db.close()


@bp.route("/<int:guild_id>/members", methods=["GET"])
def get_guild_roster(guild_id: int):
    """
    Get guild roster

    Returns all guild members with their ranks.
    Only accessible by guild members.
    """
    bnet_id = get_current_user()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = next(get_db())

    try:
        # Verify user is a member of this guild
        member = (
            db.query(GuildMember)
            .filter(GuildMember.bnet_id == bnet_id, GuildMember.guild_id == guild_id)
            .first()
        )

        if not member:
            return jsonify({"error": "Not a member of this guild"}), 403

        # Fetch all guild members
        members = (
            db.query(GuildMember)
            .filter(GuildMember.guild_id == guild_id)
            .order_by(GuildMember.rank_id.asc())
            .all()
        )

        roster = {
            "guild_id": guild_id,
            "member_count": len(members),
            "members": [member.to_dict() for member in members],
        }

        return jsonify(roster), 200

    finally:
        db.close()


@bp.route("/<int:guild_id>/permissions", methods=["PUT"])
def update_permissions(guild_id: int):
    """
    Update guild permissions (GM only)

    Request body:
    {
        "tool_name": "recruitment",
        "min_rank_id": 1,  // 0=GM, 1=Officer, etc.
        "enabled": true
    }
    """
    bnet_id = get_current_user()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = next(get_db())

    try:
        # Verify user is GM of this guild
        guild = db.query(Guild).filter(Guild.id == guild_id).first()
        if not guild or guild.deleted_at:
            return jsonify({"error": "Guild not found"}), 404

        if guild.gm_bnet_id != bnet_id:
            return jsonify({"error": "Only Guild Master can update permissions"}), 403

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        tool_name = data.get("tool_name")
        if not tool_name:
            return jsonify({"error": "tool_name is required"}), 400

        # Find or create permission
        permission = (
            db.query(GuildPermission)
            .filter(
                GuildPermission.guild_id == guild_id,
                GuildPermission.tool_name == tool_name,
            )
            .first()
        )

        if permission:
            # Update existing
            if "min_rank_id" in data:
                permission.min_rank_id = data["min_rank_id"]
            if "enabled" in data:
                permission.enabled = data["enabled"]
        else:
            # Create new
            permission = GuildPermission(
                guild_id=guild_id,
                tool_name=tool_name,
                min_rank_id=data.get("min_rank_id", 0),
                enabled=data.get("enabled", True),
            )
            db.add(permission)

        db.commit()

        current_app.logger.info(
            f"Permissions updated for guild {guild_id}, tool {tool_name}"
        )

        return jsonify(permission.to_dict()), 200

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to update permissions: {e}")
        return jsonify({"error": "Failed to update permissions"}), 500
    finally:
        db.close()


@bp.route("/<int:guild_id>/permissions/check", methods=["GET"])
def check_permissions(guild_id: int):
    """
    Check user's permissions for a tool in a guild

    Query parameters:
        - tool: Tool name to check (e.g., "progress", "recruitment")
        - bnet_id: User's Bnet ID (optional, defaults to current user)

    Used by other services (progress-api, recruitment-api) to verify permissions.
    """
    bnet_id = request.args.get("bnet_id")
    if not bnet_id:
        # Default to current user
        bnet_id = get_current_user()
        if not bnet_id:
            return jsonify({"error": "Not authenticated"}), 401
    else:
        bnet_id = int(bnet_id)

    tool = request.args.get("tool")
    if not tool:
        return jsonify({"error": "tool parameter required"}), 400

    # Check permission
    result = check_permission_cached(bnet_id, guild_id, tool)

    return jsonify(result), 200


@bp.route("/<int:guild_id>/sync-crest", methods=["POST"])
def sync_guild_crest(guild_id: int):
    """
    Sync guild crest from Blizzard API (GM only)

    Fetches the guild's crest/emblem data from Blizzard and stores it.
    Returns the updated guild data with crest_data and crest_updated_at.
    """
    bnet_id = get_current_user()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = next(get_db())

    try:
        # Fetch guild
        guild = db.query(Guild).filter(Guild.id == guild_id).first()
        if not guild or guild.deleted_at:
            return jsonify({"error": "Guild not found"}), 404

        # Verify user is GM of this guild
        if guild.gm_bnet_id != bnet_id:
            return jsonify({"error": "Only Guild Master can sync guild crest"}), 403

        # Get access token from cookie
        access_token = request.cookies.get("access_token")
        if not access_token:
            return jsonify({"error": "No Blizzard access token"}), 401

        # Fetch crest from Blizzard
        from app.services.blizzard_service import fetch_guild_crest

        crest_data = fetch_guild_crest(
            access_token, guild.name, guild.realm, region="us"  # TODO: Make region configurable
        )

        if not crest_data:
            return jsonify({"error": "Guild crest not found on Blizzard API"}), 404

        # Update guild
        guild.crest_data = crest_data
        guild.crest_updated_at = datetime.now(timezone.utc)
        db.commit()

        current_app.logger.info(f"Guild crest synced: {guild_id} by bnet_id={bnet_id}")

        return jsonify(guild.to_dict()), 200

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to sync guild crest: {e}")
        return jsonify({"error": "Failed to sync guild crest"}), 500
    finally:
        db.close()


@bp.route("/<int:guild_id>", methods=["DELETE"])
def delete_guild(guild_id: int):
    """
    Soft delete a guild (GM only)

    Sets deleted_at timestamp instead of actually deleting the record.
    """
    bnet_id = get_current_user()
    if not bnet_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = next(get_db())

    try:
        # Verify user is GM of this guild
        guild = db.query(Guild).filter(Guild.id == guild_id).first()
        if not guild:
            return jsonify({"error": "Guild not found"}), 404

        if guild.deleted_at:
            return jsonify({"error": "Guild already deleted"}), 410

        if guild.gm_bnet_id != bnet_id:
            return jsonify({"error": "Only Guild Master can delete guild"}), 403

        # Soft delete
        guild.deleted_at = datetime.utcnow()
        db.commit()

        current_app.logger.info(f"Guild soft-deleted: {guild_id} by bnet_id={bnet_id}")

        return jsonify({"message": "Guild deleted", "guild_id": guild_id}), 200

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to delete guild: {e}")
        return jsonify({"error": "Failed to delete guild"}), 500
    finally:
        db.close()
