"""Seed weekly targets for expansion 12.0"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.models import Base, engine, SessionLocal
from app.models.weekly_target import WeeklyTarget

# Weekly target data for expansion 12.0
EXPANSION_12_TARGETS = [
    {"week": 0, "ilvl": 215, "description": "Pre-season - World quests and dungeons"},
    {"week": 1, "ilvl": 235, "description": "Week 1-2: Mythic+ farm, Raid Tier 1"},
    {"week": 2, "ilvl": 235, "description": "Week 1-2: Mythic+ farm, Raid Tier 1"},
    {"week": 3, "ilvl": 250, "description": "Week 3-4: Raid Tier 2"},
    {"week": 4, "ilvl": 250, "description": "Week 3-4: Raid Tier 2"},
    {"week": 5, "ilvl": 265, "description": "Week 5-8: Mythic Raid progression"},
    {"week": 6, "ilvl": 265, "description": "Week 5-8: Mythic Raid progression"},
    {"week": 7, "ilvl": 265, "description": "Week 5-8: Mythic Raid progression"},
    {"week": 8, "ilvl": 265, "description": "Week 5-8: Mythic Raid progression"},
    {"week": 9, "ilvl": 280, "description": "Week 9-12: Mythic+ and full Mythic progression"},
    {"week": 10, "ilvl": 280, "description": "Week 9-12: Mythic+ and full Mythic progression"},
    {"week": 11, "ilvl": 280, "description": "Week 9-12: Mythic+ and full Mythic progression"},
    {"week": 12, "ilvl": 280, "description": "Week 9-12: Mythic+ and full Mythic progression"},
]


def seed_targets():
    """Seed weekly targets for expansion 12.0"""
    db = SessionLocal()

    try:
        # Check if targets already exist
        existing = db.query(WeeklyTarget).filter(WeeklyTarget.expansion_id == "12.0").first()

        if existing:
            print("Weekly targets for expansion 12.0 already exist. Skipping.")
            return

        # Create targets
        for target_data in EXPANSION_12_TARGETS:
            target = WeeklyTarget(
                expansion_id="12.0",
                week=target_data["week"],
                ilvl_target=target_data["ilvl"],
                description=target_data["description"],
            )
            db.add(target)

        db.commit()
        print(f"Successfully seeded {len(EXPANSION_12_TARGETS)} weekly targets for expansion 12.0")

    except Exception as e:
        db.rollback()
        print(f"Error seeding weekly targets: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_targets()
