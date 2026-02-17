"""Test database models"""

from app.models.character_progress import CharacterProgress
from app.models.weekly_target import WeeklyTarget
from app.models.guild_message import GuildMessage


def test_character_progress_creation(db):
    """Test creating a CharacterProgress record"""
    char = CharacterProgress(
        character_name="TestChar",
        realm="area-52",
        guild_id=1,
        class_name="Warrior",
        spec="Protection",
        role="Tank",
        current_ilvl=265.5,
        gear_details={"equipped_items": []},
    )

    db.add(char)
    db.commit()

    assert char.id is not None
    assert char.character_name == "TestChar"
    assert char.current_ilvl == 265.5


def test_character_progress_to_dict(db):
    """Test CharacterProgress to_dict serialization"""
    char = CharacterProgress(
        character_name="TestChar",
        realm="area-52",
        guild_id=1,
        current_ilvl=265.5,
    )

    db.add(char)
    db.commit()

    data = char.to_dict()

    assert data["character_name"] == "TestChar"
    assert data["realm"] == "area-52"
    assert data["current_ilvl"] == 265.5
    assert "created_at" in data


def test_weekly_target_creation(db):
    """Test creating a WeeklyTarget record"""
    target = WeeklyTarget(
        expansion_id="12.0",
        week=5,
        ilvl_target=265.0,
        description="Week 5 target",
    )

    db.add(target)
    db.commit()

    assert target.id is not None
    assert target.week == 5
    assert target.ilvl_target == 265.0


def test_guild_message_creation(db):
    """Test creating a GuildMessage record"""
    message = GuildMessage(
        guild_id=1,
        gm_message="Focus on M+ this week!",
        created_by=12345,
    )

    db.add(message)
    db.commit()

    assert message.id is not None
    assert message.guild_id == 1
    assert message.gm_message == "Focus on M+ this week!"


def test_character_gear_priorities():
    """Test gear priority calculation"""
    char = CharacterProgress(
        character_name="TestChar",
        realm="area-52",
        guild_id=1,
        gear_details={
            "equipped_items": [
                {"slot": {"name": "Head"}, "level": {"value": 270}, "name": "Helm of Testing"},
                {"slot": {"name": "Chest"}, "level": {"value": 260}, "name": "Chestplate"},
                {"slot": {"name": "Legs"}, "level": {"value": 255}, "name": "Legplates"},
            ]
        },
    )

    priorities = char.get_gear_priorities()

    assert len(priorities) == 3
    # Should be sorted by lowest iLvl first
    assert priorities[0]["ilvl"] == 255
    assert priorities[0]["slot"] == "Legs"
