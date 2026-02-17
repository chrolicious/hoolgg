"""Recruitment routes - candidate search, management, and pipeline"""

from flask import Blueprint, request, jsonify, current_app
from app.models import get_db
from app.models.recruitment_candidate import RecruitmentCandidate
from app.models.recruitment_category import RecruitmentCategory
from app.models.recruitment_history import RecruitmentHistory
from app.middleware.auth import require_permission, get_current_user
from app.services.raider_io_service import RaiderIOService
from app.services.wow_progress_service import WowProgressService
from app.services.warcraft_logs_service import WarcraftLogsService
from datetime import datetime
from sqlalchemy import or_, and_

bp = Blueprint("recruitment", __name__, url_prefix="/guilds")


# Helper function to initialize default categories for a guild
def ensure_default_categories(guild_id: int, db):
    """Ensure default categories exist for a guild"""
    default_categories = [
        {"name": "Pending", "order": 0},
        {"name": "Interested", "order": 1},
        {"name": "Top Picks", "order": 2},
        {"name": "Rejected", "order": 3},
        {"name": "Hired", "order": 4},
    ]

    for cat_data in default_categories:
        existing = (
            db.query(RecruitmentCategory)
            .filter(
                RecruitmentCategory.guild_id == guild_id,
                RecruitmentCategory.category_name == cat_data["name"],
            )
            .first()
        )

        if not existing:
            category = RecruitmentCategory(
                guild_id=guild_id,
                category_name=cat_data["name"],
                custom=0,
                display_order=cat_data["order"],
            )
            db.add(category)

    db.commit()


# Task 2.9: Search endpoint
@bp.route("/<int:guild_id>/recruitment/search", methods=["POST"])
@require_permission("recruitment")
def search_candidates(guild_id: int, bnet_id: int = None, permission: dict = None):
    """
    Search for candidates from external sources

    Request body:
    {
        "name": "CharacterName",  // optional
        "realm": "area-52",  // optional
        "region": "us",  // optional, default "us"
        "role": "Tank",  // optional
        "class": "Warrior",  // optional
        "min_ilvl": 280,  // optional
        "min_mythic_score": 2000,  // optional
        "sources": ["raider_io", "wow_progress"]  // optional, default both
    }
    """
    data = request.get_json() or {}

    name = data.get("name")
    realm = data.get("realm")
    region = data.get("region", "us")
    role = data.get("role")
    character_class = data.get("class")
    min_ilvl = data.get("min_ilvl")
    min_mythic_score = data.get("min_mythic_score")
    sources = data.get("sources", ["raider_io", "wow_progress"])

    results = []

    # Search Raider.io
    if "raider_io" in sources:
        rio_results = RaiderIOService.search_characters(
            name=name,
            realm=realm,
            region=region,
            role=role,
            character_class=character_class,
            min_mythic_score=min_mythic_score,
        )
        results.extend(rio_results)

    # Search WoW Progress
    if "wow_progress" in sources:
        wp_results = WowProgressService.search_characters(
            name=name,
            realm=realm,
            region=region,
            character_class=character_class,
            min_ilvl=min_ilvl,
        )
        results.extend(wp_results)

    # Apply filters
    if min_ilvl:
        results = [r for r in results if r.get("ilvl", 0) >= min_ilvl]

    # Sort by relevance (ilvl desc, then mythic+ rating desc)
    results.sort(
        key=lambda x: (x.get("ilvl", 0), x.get("raider_io_score", 0)), reverse=True
    )

    return jsonify({"results": results, "count": len(results)}), 200


# Task 2.10: List candidates
@bp.route("/<int:guild_id>/recruitment/candidates", methods=["GET"])
@require_permission("recruitment")
def list_candidates(guild_id: int, bnet_id: int = None, permission: dict = None):
    """
    List all candidates for a guild with filtering and sorting

    Query parameters:
        - role: Filter by role
        - class: Filter by class
        - status: Filter by status
        - category_id: Filter by category
        - min_ilvl: Filter by min ilvl
        - max_ilvl: Filter by max ilvl
        - sort_by: Field to sort by (ilvl, rating, raider_io_score, created_at)
        - sort_order: asc or desc (default: desc)
    """
    db = next(get_db())

    try:
        # Base query
        query = db.query(RecruitmentCandidate).filter(
            RecruitmentCandidate.guild_id == guild_id
        )

        # Apply filters
        role = request.args.get("role")
        if role:
            query = query.filter(RecruitmentCandidate.role == role)

        character_class = request.args.get("class")
        if character_class:
            query = query.filter(RecruitmentCandidate.character_class == character_class)

        status = request.args.get("status")
        if status:
            query = query.filter(RecruitmentCandidate.status == status)

        category_id = request.args.get("category_id")
        if category_id:
            query = query.filter(RecruitmentCandidate.category_id == int(category_id))

        min_ilvl = request.args.get("min_ilvl")
        if min_ilvl:
            query = query.filter(RecruitmentCandidate.ilvl >= int(min_ilvl))

        max_ilvl = request.args.get("max_ilvl")
        if max_ilvl:
            query = query.filter(RecruitmentCandidate.ilvl <= int(max_ilvl))

        # Apply sorting
        sort_by = request.args.get("sort_by", "created_at")
        sort_order = request.args.get("sort_order", "desc")

        sort_field = getattr(RecruitmentCandidate, sort_by, RecruitmentCandidate.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())

        candidates = query.all()

        return (
            jsonify(
                {
                    "candidates": [c.to_dict() for c in candidates],
                    "count": len(candidates),
                }
            ),
            200,
        )

    finally:
        db.close()


# Task 2.11: Get candidate details
@bp.route("/<int:guild_id>/recruitment/candidates/<int:candidate_id>", methods=["GET"])
@require_permission("recruitment")
def get_candidate(guild_id: int, candidate_id: int, bnet_id: int = None, permission: dict = None):
    """Get detailed information about a specific candidate"""
    db = next(get_db())

    try:
        candidate = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.id == candidate_id,
                RecruitmentCandidate.guild_id == guild_id,
            )
            .first()
        )

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Get contact history
        history = (
            db.query(RecruitmentHistory)
            .filter(
                RecruitmentHistory.guild_id == guild_id,
                RecruitmentHistory.candidate_id == candidate_id,
            )
            .order_by(RecruitmentHistory.contacted_date.desc())
            .all()
        )

        response = candidate.to_dict()
        response["history"] = [h.to_dict() for h in history]

        return jsonify(response), 200

    finally:
        db.close()


# Task 2.12: Add manual candidate
@bp.route("/<int:guild_id>/recruitment/candidates", methods=["POST"])
@require_permission("recruitment")
def add_candidate(guild_id: int, bnet_id: int = None, permission: dict = None):
    """
    Add a candidate manually or from search results

    Request body:
    {
        "candidate_name": "CharacterName",
        "realm": "area-52",  // optional
        "region": "us",  // optional
        "character_class": "Warrior",  // optional
        "role": "Tank",  // optional
        "ilvl": 285,  // optional
        "notes": "Found via trade chat",  // optional
        "source": "manual"  // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    candidate_name = data.get("candidate_name")
    if not candidate_name:
        return jsonify({"error": "candidate_name is required"}), 400

    db = next(get_db())

    try:
        # Ensure default categories exist
        ensure_default_categories(guild_id, db)

        # Check for duplicate
        existing = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.guild_id == guild_id,
                RecruitmentCandidate.candidate_name == candidate_name,
                RecruitmentCandidate.realm == data.get("realm"),
            )
            .first()
        )

        if existing:
            return jsonify({"error": "Candidate already exists"}), 409

        # Create candidate
        candidate = RecruitmentCandidate(
            guild_id=guild_id,
            candidate_name=candidate_name,
            realm=data.get("realm"),
            region=data.get("region", "us"),
            character_class=data.get("character_class"),
            role=data.get("role"),
            spec=data.get("spec"),
            ilvl=data.get("ilvl"),
            raid_progress=data.get("raid_progress"),
            mythic_plus_rating=data.get("mythic_plus_rating"),
            raider_io_score=data.get("raider_io_score"),
            source=data.get("source", "manual"),
            external_url=data.get("external_url"),
            notes=data.get("notes"),
            status="pending",
        )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        current_app.logger.info(
            f"Candidate added: {candidate.id} to guild {guild_id} by bnet_id={bnet_id}"
        )

        return jsonify(candidate.to_dict()), 201

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to add candidate: {e}")
        return jsonify({"error": "Failed to add candidate"}), 500
    finally:
        db.close()


# Task 2.13: Update candidate (rating, notes)
@bp.route("/<int:guild_id>/recruitment/candidates/<int:candidate_id>", methods=["PUT"])
@require_permission("recruitment")
def update_candidate(
    guild_id: int, candidate_id: int, bnet_id: int = None, permission: dict = None
):
    """
    Update candidate rating, notes, or other fields

    Request body:
    {
        "rating": 5,  // optional, 1-5
        "notes": "Great player, very skilled",  // optional
        "ilvl": 290,  // optional
        "raid_progress": "8/8 M"  // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    db = next(get_db())

    try:
        candidate = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.id == candidate_id,
                RecruitmentCandidate.guild_id == guild_id,
            )
            .first()
        )

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Update allowed fields
        if "rating" in data:
            rating = data["rating"]
            if rating is not None and (rating < 1 or rating > 5):
                return jsonify({"error": "Rating must be between 1 and 5"}), 400
            candidate.rating = rating

        if "notes" in data:
            candidate.notes = data["notes"]

        if "ilvl" in data:
            candidate.ilvl = data["ilvl"]

        if "raid_progress" in data:
            candidate.raid_progress = data["raid_progress"]

        if "mythic_plus_rating" in data:
            candidate.mythic_plus_rating = data["mythic_plus_rating"]

        db.commit()
        db.refresh(candidate)

        current_app.logger.info(f"Candidate updated: {candidate_id} by bnet_id={bnet_id}")

        return jsonify(candidate.to_dict()), 200

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to update candidate: {e}")
        return jsonify({"error": "Failed to update candidate"}), 500
    finally:
        db.close()


# Task 2.14: Update candidate status/category
@bp.route(
    "/<int:guild_id>/recruitment/candidates/<int:candidate_id>/status", methods=["PUT"]
)
@require_permission("recruitment")
def update_candidate_status(
    guild_id: int, candidate_id: int, bnet_id: int = None, permission: dict = None
):
    """
    Update candidate status or move to different category

    Request body:
    {
        "status": "interested",  // optional
        "category_id": 2  // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    db = next(get_db())

    try:
        candidate = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.id == candidate_id,
                RecruitmentCandidate.guild_id == guild_id,
            )
            .first()
        )

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        if "status" in data:
            candidate.status = data["status"]

        if "category_id" in data:
            category_id = data["category_id"]
            # Verify category exists and belongs to this guild
            if category_id:
                category = (
                    db.query(RecruitmentCategory)
                    .filter(
                        RecruitmentCategory.id == category_id,
                        RecruitmentCategory.guild_id == guild_id,
                    )
                    .first()
                )
                if not category:
                    return jsonify({"error": "Category not found"}), 404

            candidate.category_id = category_id

        db.commit()
        db.refresh(candidate)

        current_app.logger.info(
            f"Candidate status updated: {candidate_id} by bnet_id={bnet_id}"
        )

        return jsonify(candidate.to_dict()), 200

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to update candidate status: {e}")
        return jsonify({"error": "Failed to update candidate status"}), 500
    finally:
        db.close()


# Task 2.15: Log contact
@bp.route(
    "/<int:guild_id>/recruitment/candidates/<int:candidate_id>/contact", methods=["POST"]
)
@require_permission("recruitment")
def log_contact(guild_id: int, candidate_id: int, bnet_id: int = None, permission: dict = None):
    """
    Log a contact attempt with a candidate

    Request body:
    {
        "contacted_date": "2026-02-17T12:00:00Z",  // optional, defaults to now
        "method": "discord",  // required: email, discord, in-game, etc.
        "message": "Sent recruitment message",  // optional
        "response_received": false  // optional, default false
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    method = data.get("method")
    if not method:
        return jsonify({"error": "method is required"}), 400

    db = next(get_db())

    try:
        # Verify candidate exists
        candidate = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.id == candidate_id,
                RecruitmentCandidate.guild_id == guild_id,
            )
            .first()
        )

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Parse contacted_date
        contacted_date_str = data.get("contacted_date")
        if contacted_date_str:
            contacted_date = datetime.fromisoformat(
                contacted_date_str.replace("Z", "+00:00")
            )
        else:
            contacted_date = datetime.utcnow()

        # Create history entry
        history = RecruitmentHistory(
            guild_id=guild_id,
            candidate_id=candidate_id,
            contacted_date=contacted_date,
            method=method,
            message=data.get("message"),
            response_received=1 if data.get("response_received") else 0,
            logged_by_bnet_id=bnet_id,
        )

        db.add(history)

        # Update candidate's contacted status
        candidate.contacted = 1
        candidate.contacted_date = contacted_date

        db.commit()
        db.refresh(history)

        current_app.logger.info(
            f"Contact logged for candidate {candidate_id} by bnet_id={bnet_id}"
        )

        return jsonify(history.to_dict()), 201

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to log contact: {e}")
        return jsonify({"error": "Failed to log contact"}), 500
    finally:
        db.close()


# Task 2.16: Pipeline view (Kanban)
@bp.route("/<int:guild_id>/recruitment/pipeline", methods=["GET"])
@require_permission("recruitment")
def get_pipeline(guild_id: int, bnet_id: int = None, permission: dict = None):
    """
    Get recruitment pipeline view (Kanban-style)

    Returns candidates organized by category
    """
    db = next(get_db())

    try:
        # Ensure default categories exist
        ensure_default_categories(guild_id, db)

        # Get all categories
        categories = (
            db.query(RecruitmentCategory)
            .filter(RecruitmentCategory.guild_id == guild_id)
            .order_by(RecruitmentCategory.display_order.asc())
            .all()
        )

        # Build pipeline
        pipeline = []
        for category in categories:
            # Get candidates in this category
            candidates = (
                db.query(RecruitmentCandidate)
                .filter(
                    RecruitmentCandidate.guild_id == guild_id,
                    RecruitmentCandidate.category_id == category.id,
                )
                .order_by(RecruitmentCandidate.updated_at.desc())
                .all()
            )

            pipeline.append(
                {
                    "category": category.to_dict(),
                    "candidates": [c.to_dict() for c in candidates],
                    "count": len(candidates),
                }
            )

        # Also get uncategorized candidates
        uncategorized = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.guild_id == guild_id,
                RecruitmentCandidate.category_id.is_(None),
            )
            .order_by(RecruitmentCandidate.updated_at.desc())
            .all()
        )

        if uncategorized:
            pipeline.insert(
                0,
                {
                    "category": {
                        "id": None,
                        "category_name": "Uncategorized",
                        "custom": False,
                    },
                    "candidates": [c.to_dict() for c in uncategorized],
                    "count": len(uncategorized),
                },
            )

        return jsonify({"pipeline": pipeline}), 200

    finally:
        db.close()


# Task 2.18: Compare candidates
@bp.route("/<int:guild_id>/recruitment/compare", methods=["GET"])
@require_permission("recruitment")
def compare_candidates(guild_id: int, bnet_id: int = None, permission: dict = None):
    """
    Compare multiple candidates side-by-side

    Query parameters:
        - candidate_ids: Comma-separated list of candidate IDs
    """
    candidate_ids_str = request.args.get("candidate_ids")
    if not candidate_ids_str:
        return jsonify({"error": "candidate_ids parameter required"}), 400

    try:
        candidate_ids = [int(x) for x in candidate_ids_str.split(",")]
    except ValueError:
        return jsonify({"error": "Invalid candidate_ids format"}), 400

    db = next(get_db())

    try:
        candidates = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.guild_id == guild_id,
                RecruitmentCandidate.id.in_(candidate_ids),
            )
            .all()
        )

        if not candidates:
            return jsonify({"error": "No candidates found"}), 404

        # Return comparison data
        comparison = {
            "candidates": [c.to_dict() for c in candidates],
            "count": len(candidates),
        }

        return jsonify(comparison), 200

    finally:
        db.close()


# Task 2.19: Raid composition view
@bp.route("/<int:guild_id>/recruitment/composition", methods=["GET"])
@require_permission("recruitment")
def get_composition(guild_id: int, bnet_id: int = None, permission: dict = None):
    """
    View raid composition needs

    Returns current candidates grouped by role and class
    to help identify gaps in raid composition
    """
    db = next(get_db())

    try:
        # Get all active candidates (not rejected/hired)
        candidates = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.guild_id == guild_id,
                RecruitmentCandidate.status.notin_(["rejected", "hired"]),
            )
            .all()
        )

        # Group by role
        composition = {"Tank": [], "Healer": [], "Melee DPS": [], "Ranged DPS": [], "Unknown": []}

        for candidate in candidates:
            role = candidate.role or "Unknown"
            if role not in composition:
                composition[role] = []
            composition[role].append(candidate.to_dict())

        # Calculate counts
        summary = {role: len(candidates) for role, candidates in composition.items()}

        return (
            jsonify(
                {
                    "composition": composition,
                    "summary": summary,
                    "total_candidates": len(candidates),
                }
            ),
            200,
        )

    finally:
        db.close()


# Task 2.21: Category management
@bp.route("/<int:guild_id>/recruitment/categories", methods=["GET"])
@require_permission("recruitment")
def list_categories(guild_id: int, bnet_id: int = None, permission: dict = None):
    """List all recruitment categories for a guild"""
    db = next(get_db())

    try:
        # Ensure default categories exist
        ensure_default_categories(guild_id, db)

        categories = (
            db.query(RecruitmentCategory)
            .filter(RecruitmentCategory.guild_id == guild_id)
            .order_by(RecruitmentCategory.display_order.asc())
            .all()
        )

        return jsonify({"categories": [c.to_dict() for c in categories]}), 200

    finally:
        db.close()


@bp.route("/<int:guild_id>/recruitment/categories", methods=["POST"])
@require_permission("recruitment")
def create_category(guild_id: int, bnet_id: int = None, permission: dict = None):
    """
    Create a custom recruitment category

    Request body:
    {
        "category_name": "High Priority",
        "display_order": 10  // optional
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    category_name = data.get("category_name")
    if not category_name:
        return jsonify({"error": "category_name is required"}), 400

    db = next(get_db())

    try:
        # Check for duplicate
        existing = (
            db.query(RecruitmentCategory)
            .filter(
                RecruitmentCategory.guild_id == guild_id,
                RecruitmentCategory.category_name == category_name,
            )
            .first()
        )

        if existing:
            return jsonify({"error": "Category already exists"}), 409

        # Get max display_order
        max_order = (
            db.query(RecruitmentCategory.display_order)
            .filter(RecruitmentCategory.guild_id == guild_id)
            .order_by(RecruitmentCategory.display_order.desc())
            .first()
        )

        display_order = data.get("display_order")
        if display_order is None:
            display_order = (max_order[0] + 1) if max_order else 0

        # Create category
        category = RecruitmentCategory(
            guild_id=guild_id,
            category_name=category_name,
            custom=1,
            display_order=display_order,
        )

        db.add(category)
        db.commit()
        db.refresh(category)

        current_app.logger.info(
            f"Category created: {category.id} for guild {guild_id} by bnet_id={bnet_id}"
        )

        return jsonify(category.to_dict()), 201

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to create category: {e}")
        return jsonify({"error": "Failed to create category"}), 500
    finally:
        db.close()


@bp.route("/<int:guild_id>/recruitment/categories/<int:category_id>", methods=["DELETE"])
@require_permission("recruitment")
def delete_category(
    guild_id: int, category_id: int, bnet_id: int = None, permission: dict = None
):
    """Delete a custom category (only custom categories can be deleted)"""
    db = next(get_db())

    try:
        category = (
            db.query(RecruitmentCategory)
            .filter(
                RecruitmentCategory.id == category_id,
                RecruitmentCategory.guild_id == guild_id,
            )
            .first()
        )

        if not category:
            return jsonify({"error": "Category not found"}), 404

        if not category.custom:
            return jsonify({"error": "Cannot delete default categories"}), 403

        # Move candidates to uncategorized
        db.query(RecruitmentCandidate).filter(
            RecruitmentCandidate.category_id == category_id
        ).update({"category_id": None})

        db.delete(category)
        db.commit()

        current_app.logger.info(f"Category deleted: {category_id} by bnet_id={bnet_id}")

        return jsonify({"message": "Category deleted"}), 200

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to delete category: {e}")
        return jsonify({"error": "Failed to delete category"}), 500
    finally:
        db.close()


# Delete candidate
@bp.route("/<int:guild_id>/recruitment/candidates/<int:candidate_id>", methods=["DELETE"])
@require_permission("recruitment")
def delete_candidate(
    guild_id: int, candidate_id: int, bnet_id: int = None, permission: dict = None
):
    """Delete a candidate from the recruitment list"""
    db = next(get_db())

    try:
        candidate = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.id == candidate_id,
                RecruitmentCandidate.guild_id == guild_id,
            )
            .first()
        )

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Delete associated history
        db.query(RecruitmentHistory).filter(
            RecruitmentHistory.candidate_id == candidate_id
        ).delete()

        db.delete(candidate)
        db.commit()

        current_app.logger.info(f"Candidate deleted: {candidate_id} by bnet_id={bnet_id}")

        return jsonify({"message": "Candidate deleted"}), 200

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to delete candidate: {e}")
        return jsonify({"error": "Failed to delete candidate"}), 500
    finally:
        db.close()


# Get candidate contact history
@bp.route(
    "/<int:guild_id>/recruitment/candidates/<int:candidate_id>/history", methods=["GET"]
)
@require_permission("recruitment")
def get_candidate_history(
    guild_id: int, candidate_id: int, bnet_id: int = None, permission: dict = None
):
    """Get contact history for a candidate"""
    db = next(get_db())

    try:
        # Verify candidate exists
        candidate = (
            db.query(RecruitmentCandidate)
            .filter(
                RecruitmentCandidate.id == candidate_id,
                RecruitmentCandidate.guild_id == guild_id,
            )
            .first()
        )

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Get history
        history = (
            db.query(RecruitmentHistory)
            .filter(
                RecruitmentHistory.guild_id == guild_id,
                RecruitmentHistory.candidate_id == candidate_id,
            )
            .order_by(RecruitmentHistory.contacted_date.desc())
            .all()
        )

        return (
            jsonify(
                {
                    "candidate_id": candidate_id,
                    "history": [h.to_dict() for h in history],
                    "count": len(history),
                }
            ),
            200,
        )

    finally:
        db.close()
