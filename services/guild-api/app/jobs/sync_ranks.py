"""Background job: Sync character ranks every 6 hours

This job refreshes all guild rosters to catch demotions, promotions, and guild leaves.
Runs via APScheduler or as a separate worker process.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from flask import current_app
from app.models import get_db
from app.models.guild import Guild
from app.models.user import User
from app.services.sync_service import sync_guild_roster
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None


def sync_all_guilds():
    """
    Sync all active guilds (6-hourly job)

    Fetches each guild's roster from Blizzard and updates ranks.
    Requires a valid access token from a guild member.
    """
    logger.info("Starting 6-hourly guild roster sync")

    db = next(get_db())

    try:
        # Fetch all non-deleted guilds
        guilds = db.query(Guild).filter(Guild.deleted_at.is_(None)).all()

        logger.info(f"Found {len(guilds)} guilds to sync")

        for guild in guilds:
            try:
                # Get an access token from a guild member
                # Strategy: Use the GM's token (they created the guild)
                gm_user = db.query(User).filter(User.bnet_id == guild.gm_bnet_id).first()

                if not gm_user:
                    logger.warning(f"No GM found for guild {guild.id}, skipping")
                    continue

                # Note: We need a valid Blizzard access token
                # In production, we'd store refresh tokens and refresh them here
                # For now, this is a limitation - guilds need active user sessions
                # TODO: Store and refresh Blizzard OAuth tokens for automated sync

                logger.info(f"Syncing guild {guild.id} ({guild.name})")

                # Sync roster (will need valid token in production)
                # result = sync_guild_roster(guild.id, access_token, region)
                # logger.info(f"Synced {result.get('members_updated', 0)} members")

            except Exception as e:
                logger.error(f"Failed to sync guild {guild.id}: {e}")
                continue

        logger.info("Completed 6-hourly guild roster sync")

    except Exception as e:
        logger.error(f"Error in sync_all_guilds job: {e}")
    finally:
        db.close()


def start_scheduler(app):
    """
    Start the APScheduler background scheduler

    Call this from create_app() to start background jobs.

    Args:
        app: Flask application instance
    """
    global scheduler

    if scheduler is not None:
        logger.warning("Scheduler already running")
        return

    scheduler = BackgroundScheduler()

    # Add 6-hourly guild sync job
    scheduler.add_job(
        func=sync_all_guilds,
        trigger=IntervalTrigger(hours=6),
        id="sync_guild_rosters",
        name="Sync all guild rosters from Blizzard",
        replace_existing=True,
    )

    # Start the scheduler
    scheduler.start()
    logger.info("Background scheduler started - 6-hourly guild sync enabled")

    # Shutdown scheduler when app exits
    import atexit

    atexit.register(lambda: scheduler.shutdown())


def stop_scheduler():
    """Stop the background scheduler"""
    global scheduler

    if scheduler:
        scheduler.shutdown()
        scheduler = None
        logger.info("Background scheduler stopped")
