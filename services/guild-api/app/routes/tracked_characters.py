"""Tracked characters routes"""

from flask import Blueprint, request, jsonify
from sqlalchemy import and_
from app.middleware.auth import require_auth, require_guild_member
from app.models import UserTrackedCharacter, get_db

bp = Blueprint('tracked_characters', __name__)


@bp.route('/guilds/<int:guild_id>/tracked-characters', methods=['GET'])
@require_auth
@require_guild_member
def get_tracked_characters(guild_id):
    """Get user's tracked characters for this guild"""
    bnet_id = request.user['bnet_id']

    db = next(get_db())

    try:
        characters = db.query(UserTrackedCharacter).filter(
            and_(
                UserTrackedCharacter.guild_id == guild_id,
                UserTrackedCharacter.bnet_id == bnet_id,
                UserTrackedCharacter.tracked == True
            )
        ).all()

        return jsonify({
            'characters': [char.to_dict() for char in characters]
        }), 200

    finally:
        db.close()


@bp.route('/guilds/<int:guild_id>/tracked-characters', methods=['PATCH'])
@require_auth
@require_guild_member
def update_tracked_character(guild_id):
    """Add or update a tracked character"""
    bnet_id = request.user['bnet_id']
    data = request.get_json()

    character_name = data.get('character_name')
    realm = data.get('realm')
    is_main = data.get('is_main', False)
    tracked = data.get('tracked', True)

    if not character_name or not realm:
        return jsonify({'error': 'character_name and realm required'}), 400

    db = next(get_db())

    try:
        # Find or create character
        character = db.query(UserTrackedCharacter).filter(
            and_(
                UserTrackedCharacter.guild_id == guild_id,
                UserTrackedCharacter.bnet_id == bnet_id,
                UserTrackedCharacter.character_name == character_name,
                UserTrackedCharacter.realm == realm,
            )
        ).first()

        if character:
            # Update existing
            character.tracked = tracked
            character.is_main = is_main
        else:
            # Create new
            character = UserTrackedCharacter(
                guild_id=guild_id,
                bnet_id=bnet_id,
                character_name=character_name,
                realm=realm,
                is_main=is_main,
                tracked=tracked,
            )
            db.add(character)

        # If setting as main, unset other mains for this user
        if is_main:
            # First flush to get character.id if it's new
            db.flush()

            # Unset other mains
            db.query(UserTrackedCharacter).filter(
                and_(
                    UserTrackedCharacter.guild_id == guild_id,
                    UserTrackedCharacter.bnet_id == bnet_id,
                    UserTrackedCharacter.id != character.id,
                )
            ).update({'is_main': False})

        db.commit()
        db.refresh(character)

        return jsonify(character.to_dict()), 200

    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()
