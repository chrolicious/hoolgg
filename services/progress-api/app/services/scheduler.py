"""APScheduler setup for periodic background sync of active characters."""

import logging
from datetime import datetime, timezone, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def init_scheduler(app):
    """Initialize and start the background scheduler."""
    if scheduler.running:
        return

    scheduler.add_job(
        func=sync_active_characters,
        trigger="interval",
        hours=1,
        id="sync_active_characters",
        replace_existing=True,
        kwargs={"app": app},
    )

    scheduler.start()
    logger.info("APScheduler started: sync_active_characters every 1 hour")


def shutdown_scheduler():
    """Gracefully shut down the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler shut down")


def sync_active_characters(app):
    """
    Sync characters that have been viewed/used in the last 24 hours.

    Stagger syncs across the hour to avoid API bursts.
    Skip characters synced less than 30 minutes ago.
    """
    import time
    from app.models import get_db
    from app.models.character_progress import CharacterProgress

    with app.app_context():
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(hours=24)
        skip_if_synced_after = now - timedelta(minutes=30)

        db = next(get_db())
        try:
            characters = (
                db.query(CharacterProgress)
                .filter(CharacterProgress.last_updated >= cutoff)
                .all()
            )

            if not characters:
                logger.debug("No active characters to sync")
                return

            logger.info(f"Background sync: {len(characters)} active characters")

            stagger_seconds = 3600 / max(len(characters), 1)

            for i, char in enumerate(characters):
                if char.last_gear_sync and char.last_gear_sync > skip_if_synced_after:
                    continue

                try:
                    _sync_single_character(char, db)
                except Exception as e:
                    logger.error(f"Background sync failed for {char.character_name}: {e}")
                    db.rollback()

                if i < len(characters) - 1:
                    time.sleep(min(stagger_seconds, 60))

        finally:
            db.close()


def _sync_single_character(char, db):
    """Run a lightweight sync for a single character (Raider.IO + vault auto-fill only)."""
    from app.services.raiderio_service import RaiderIOService, parse_raiderio_profile
    from app.services.vault_autofill import auto_fill_raid_vault
    from app.services.season_service import calculate_current_week
    from app.models.great_vault_entry import GreatVaultEntry

    region = char.region or "us"
    now = datetime.now(timezone.utc)

    rio_service = RaiderIOService()
    rio_data = rio_service.get_character_profile(char.character_name, char.realm, region)
    if rio_data:
        mplus, raid, recent_runs = parse_raiderio_profile(rio_data)
        char.mythic_plus_score = mplus
        char.raid_progress = raid
        char.last_raiderio_sync = now

        current_week = calculate_current_week(region)
        vault_entry = db.query(GreatVaultEntry).filter(
            GreatVaultEntry.character_id == char.id,
            GreatVaultEntry.week_number == current_week,
        ).first()

        if not vault_entry:
            nested = db.begin_nested()
            try:
                vault_entry = GreatVaultEntry(character_id=char.id, week_number=current_week)
                db.add(vault_entry)
                nested.commit()
            except IntegrityError:
                nested.rollback()
                vault_entry = db.query(GreatVaultEntry).filter(
                    GreatVaultEntry.character_id == char.id,
                    GreatVaultEntry.week_number == current_week,
                ).first()

        vault_entry.m_plus_runs = recent_runs

        try:
            auto_fill_raid_vault(char, vault_entry, current_week, region, db)
        except Exception as e:
            logger.warning(f"Background vault auto-fill failed: {e}")

        db.commit()
