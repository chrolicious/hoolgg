"""Character and guild sync service - syncs data from Blizzard on login"""

from typing import List, Dict
from flask import current_app
from app.services.blizzard_service import (
    fetch_user_characters,
    fetch_character_guild,
    fetch_guild_rank_names,
    BlizzardAPIError,
)
from app.models import get_db
from app.models.user import User
from app.models.guild_member import GuildMember
from sqlalchemy.orm import Session
from datetime import datetime


def sync_user_characters_on_login(
    bnet_id: int, bnet_username: str, blizzard_access_token: str, region: str = "us"
) -> Dict:
    """
    Sync user's characters and guild memberships on login

    This is called during OAuth callback (task 0.12).
    Fetches all characters, their guild memberships, and ranks.
    Updates database with latest data.

    Args:
        bnet_id: Battle.net account ID
        bnet_username: Battle.net username
        blizzard_access_token: Access token from Blizzard OAuth
        region: API region

    Returns:
        Dictionary with sync results: {
            "user": user_data,
            "characters": [character_data],
            "guilds": [guild_data],
        }
    """
    db: Session = next(get_db())

    try:
        # Create or update user
        user = db.query(User).filter(User.bnet_id == bnet_id).first()
        if user:
            user.bnet_username = bnet_username
            user.last_login = datetime.utcnow()
        else:
            user = User(bnet_id=bnet_id, bnet_username=bnet_username)
            db.add(user)

        db.commit()

        # Fetch all characters from Blizzard
        try:
            characters = fetch_user_characters(blizzard_access_token, region)
        except BlizzardAPIError as e:
            current_app.logger.error(f"Failed to fetch characters for {bnet_id}: {e}")
            return {
                "user": user.to_dict(),
                "characters": [],
                "guilds": [],
                "error": "Failed to fetch characters from Blizzard",
            }

        synced_characters = []
        synced_guilds = []

        # For each character, fetch guild membership
        for char in characters:
            char_name = char["name"]
            realm = char["realm"]

            if not char_name or not realm:
                continue

            # Fetch guild membership
            try:
                guild_data = fetch_character_guild(
                    blizzard_access_token, char_name, realm, region
                )
            except BlizzardAPIError as e:
                current_app.logger.warning(
                    f"Failed to fetch guild for {char_name}: {e}"
                )
                guild_data = None

            # Update or create guild_member record
            member = (
                db.query(GuildMember)
                .filter(GuildMember.character_name == char_name)
                .first()
            )

            if guild_data:
                # Character is in a guild
                guild_id = None  # TODO: Will be populated when we link to Guild table
                rank_id = guild_data["rank_id"]
                rank_name = guild_data["rank_name"]

                if member:
                    member.guild_id = guild_id
                    member.rank_id = rank_id
                    member.rank_name = rank_name
                    member.last_sync = datetime.utcnow()
                else:
                    member = GuildMember(
                        character_name=char_name,
                        guild_id=guild_id,
                        bnet_id=bnet_id,
                        rank_id=rank_id,
                        rank_name=rank_name,
                    )
                    db.add(member)

                synced_characters.append(
                    {
                        "name": char_name,
                        "realm": realm,
                        "guild": guild_data["name"],
                        "rank": rank_name,
                    }
                )
                synced_guilds.append(guild_data)

            else:
                # Character not in a guild
                if member:
                    member.guild_id = None
                    member.rank_id = 0
                    member.rank_name = "No Guild"
                    member.last_sync = datetime.utcnow()
                else:
                    member = GuildMember(
                        character_name=char_name,
                        guild_id=None,
                        bnet_id=bnet_id,
                        rank_id=0,
                        rank_name="No Guild",
                    )
                    db.add(member)

                synced_characters.append(
                    {"name": char_name, "realm": realm, "guild": None, "rank": None}
                )

        db.commit()

        return {
            "user": user.to_dict(),
            "characters": synced_characters,
            "guilds": synced_guilds,
        }

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error syncing user characters: {e}")
        raise
    finally:
        db.close()


def sync_guild_roster(guild_id: int, access_token: str, region: str = "us") -> Dict:
    """
    Sync a guild's complete roster from Blizzard

    This is called by background job (task 0.13) and on-demand.
    Updates all guild member ranks.

    Args:
        guild_id: Guild ID in our database
        access_token: Blizzard OAuth access token (from a guild member)
        region: API region

    Returns:
        Dictionary with sync results
    """
    db: Session = next(get_db())

    try:
        # Fetch guild from database
        from app.models.guild import Guild

        guild = db.query(Guild).filter(Guild.id == guild_id).first()
        if not guild:
            return {"error": "Guild not found"}

        guild_name = guild.name
        realm = guild.realm

        # Fetch roster from Blizzard
        try:
            from app.services.blizzard_service import fetch_guild_roster

            roster = fetch_guild_roster(access_token, guild_name, realm, region)
        except BlizzardAPIError as e:
            current_app.logger.error(f"Failed to fetch roster for guild {guild_id}: {e}")
            return {"error": f"Failed to fetch roster: {str(e)}"}

        # Fetch rank names
        try:
            rank_names = fetch_guild_rank_names(access_token, guild_name, realm, region)
        except BlizzardAPIError as e:
            current_app.logger.warning(f"Failed to fetch rank names: {e}")
            rank_names = {}

        updated_members = []

        # Update each member
        for member_data in roster:
            char_name = member_data["character_name"]
            rank_id = member_data["rank_id"]
            rank_name = rank_names.get(rank_id, f"Rank {rank_id}")

            member = (
                db.query(GuildMember)
                .filter(GuildMember.character_name == char_name)
                .first()
            )

            if member:
                member.guild_id = guild_id
                member.rank_id = rank_id
                member.rank_name = rank_name
                member.last_sync = datetime.utcnow()
            else:
                # Member not in our database yet (new character)
                member = GuildMember(
                    character_name=char_name,
                    guild_id=guild_id,
                    bnet_id=0,  # Unknown - will be updated when user logs in
                    rank_id=rank_id,
                    rank_name=rank_name,
                )
                db.add(member)

            updated_members.append(
                {"character_name": char_name, "rank_id": rank_id, "rank_name": rank_name}
            )

        db.commit()

        return {"guild_id": guild_id, "members_updated": len(updated_members)}

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error syncing guild roster: {e}")
        raise
    finally:
        db.close()
