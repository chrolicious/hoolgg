# Dashboard Header Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-width sticker-style badge header for the guild dashboard with role-specific views, character management, and actionable insights for GMs.

**Architecture:** Extend Badge component with horizontal variant, create DashboardHeader component using Badge, add backend APIs for guild crest and dashboard stats, implement character tracking with main selection.

**Tech Stack:** React, TypeScript, Framer Motion, CSS Modules, Flask (Python), SQLAlchemy, Blizzard API

---

## Phase 1: Badge Horizontal Variant

### Task 1: Add Horizontal Variant CSS to Badge

**Files:**
- Modify: `packages/design-system/src/components/primitives/Badge.tsx`
- Modify: `packages/design-system/src/components/primitives/Badge.module.css`
- Create: `packages/design-system/src/components/primitives/Badge.stories.tsx`

**Step 1: Add orientation prop to Badge component**

Modify `Badge.tsx` to add orientation prop:

```typescript
export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  orientation?: 'vertical' | 'horizontal'; // Add this
  profileIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      orientation = 'vertical', // Default to vertical
      profileIcon,
      className,
      children,
      onClick,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.badge} ${styles[size]} ${orientation === 'horizontal' ? styles.horizontal : ''} ${className || ''}`}
        style={variantVars[variant] as React.CSSProperties}
        data-variant={variant}
        onClick={onClick}
      >
        {/* ... rest of component */}
      </div>
    );
  },
);
```

**Step 2: Add horizontal CSS class to Badge.module.css**

Add at the end of `Badge.module.css`:

```css
/* Horizontal variant */
.horizontal {
  --badge-width: 100%;
  --badge-height: 140px;
  width: 100%;
  height: var(--badge-height);
  max-width: 100%;
}

.horizontal .inside {
  flex-direction: row;
  align-items: stretch;
}

.horizontal .profileIcon {
  width: 80px;
  height: 100%;
  border-bottom: none;
  border-right: var(--hool-border-thin) solid var(--btn-border-color, #1d2119);
}

.horizontal .content {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--hool-space-3);
  gap: var(--hool-space-3);
}

.horizontal .header,
.horizontal .body,
.horizontal .footer {
  flex: 1;
  background-image: none;
  padding-bottom: 0;
  margin-bottom: 0;
  text-align: left;
}

.horizontal .header {
  border-right: var(--hool-border-thin) solid rgba(29, 33, 25, 0.35);
  padding-right: var(--hool-space-2);
}

.horizontal .body {
  border-right: var(--hool-border-thin) solid rgba(29, 33, 25, 0.35);
  padding-right: var(--hool-space-2);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.horizontal .footer {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Reposition star for horizontal layout */
.horizontal .inside::before {
  bottom: -60px;
  right: -60px;
  width: 120px;
  height: 120px;
}
```

**Step 3: Create Storybook story for horizontal variant**

Create `Badge.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Badge, BadgeHeader, BadgeBody, BadgeFooter } from './Badge';
import { StickerIcon } from './StickerIcon';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    orientation: 'horizontal',
    profileIcon: <StickerIcon name="trophy" size={48} />,
  },
  render: (args) => (
    <Badge {...args}>
      <BadgeHeader>
        <div>Guild Name</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Realm Name</div>
      </BadgeHeader>
      <BadgeBody>
        <div>Character Name</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>650 ilvl</div>
        <div>Weekly Progress: 75%</div>
      </BadgeBody>
      <BadgeFooter>
        <button>View Details</button>
      </BadgeFooter>
    </Badge>
  ),
};

export const HorizontalFullWidth: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    orientation: 'horizontal',
    profileIcon: <StickerIcon name="shield" size={48} />,
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <Badge {...args}>
        <BadgeHeader>
          <div>Epic Guild</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Illidan-US</div>
        </BadgeHeader>
        <BadgeBody>
          <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Team Overview</div>
          <div>Avg ilvl: 645 ↑</div>
          <div>32/45 on track</div>
          <div style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ 8 need attention</div>
        </BadgeBody>
        <BadgeFooter>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button>←</button>
            <div>•○</div>
            <button>→</button>
          </div>
        </BadgeFooter>
      </Badge>
    </div>
  ),
};
```

**Step 4: Run Storybook to verify horizontal variant**

Run: `pnpm storybook`
Expected: Navigate to "Primitives/Badge/Horizontal" story, badge displays horizontally with correct layout

**Step 5: Commit Badge horizontal variant**

```bash
git add packages/design-system/src/components/primitives/Badge.tsx \
        packages/design-system/src/components/primitives/Badge.module.css \
        packages/design-system/src/components/primitives/Badge.stories.tsx
git commit -m "feat(design-system): add horizontal orientation to Badge component

- Add orientation prop (vertical|horizontal)
- Implement horizontal CSS layout with flex-direction row
- Reposition profile icon and content sections for horizontal flow
- Add Storybook stories demonstrating horizontal usage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Backend - User Tracked Characters

### Task 2: Create User Tracked Characters Table

**Files:**
- Create: `services/guild-api/alembic/versions/003_user_tracked_characters.py`

**Step 1: Create migration for user_tracked_characters table**

Create migration file:

```python
"""Add user_tracked_characters table

Revision ID: 005
Revises: 004
Create Date: 2026-02-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user_tracked_characters',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('guild_id', sa.Integer(), nullable=False),
        sa.Column('bnet_id', sa.Integer(), nullable=False),
        sa.Column('character_name', sa.String(50), nullable=False),
        sa.Column('realm', sa.String(100), nullable=False),
        sa.Column('is_main', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('tracked', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['guild_id'], ['guilds.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('guild_id', 'bnet_id', 'character_name', 'realm', name='uix_guild_user_character'),
    )

    # Indexes for fast lookups
    op.create_index('ix_user_tracked_characters_id', 'user_tracked_characters', ['id'], unique=False)
    op.create_index('ix_user_tracked_characters_guild_bnet', 'user_tracked_characters', ['guild_id', 'bnet_id'])


def downgrade():
    op.drop_index('ix_user_tracked_characters_guild_bnet', table_name='user_tracked_characters')
    op.drop_index('ix_user_tracked_characters_id', table_name='user_tracked_characters')
    op.drop_table('user_tracked_characters')
```

**Step 2: Run migration**

Run:
```bash
cd services/guild-api
alembic upgrade head
```
Expected: Migration runs successfully, table created

**Step 3: Commit migration**

```bash
git add services/guild-api/alembic/versions/005_user_tracked_characters.py
git commit -m "feat(guild-api): add user_tracked_characters table migration

- Track which characters users want to monitor per guild
- Support main character selection (is_main flag)
- Unique constraint on guild + user + character + realm

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 3: Create Tracked Character Model

**Files:**
- Create: `services/guild-api/app/models/user_tracked_character.py`
- Modify: `services/guild-api/app/models/__init__.py`

**Step 1: Create UserTrackedCharacter model**

Create `user_tracked_character.py`:

```python
"""User tracked character model"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class UserTrackedCharacter(Base):
    """Characters that users track for guild progress"""

    __tablename__ = 'user_tracked_characters'

    id = Column(Integer, primary_key=True, autoincrement=True)
    guild_id = Column(Integer, ForeignKey('guilds.id', ondelete='CASCADE'), nullable=False)
    bnet_id = Column(Integer, nullable=False)
    character_name = Column(String(50), nullable=False)
    realm = Column(String(100), nullable=False)
    is_main = Column(Boolean, default=False, nullable=False)
    tracked = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    guild = relationship("Guild", back_populates="tracked_characters")

    # Constraints
    __table_args__ = (
        UniqueConstraint('guild_id', 'bnet_id', 'character_name', 'realm', name='uix_guild_user_character'),
    )

    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'guild_id': str(self.guild_id),
            'bnet_id': self.bnet_id,
            'character_name': self.character_name,
            'realm': self.realm,
            'is_main': self.is_main,
            'tracked': self.tracked,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
```

**Step 2: Update Guild model to add relationship**

Modify `services/guild-api/app/models/guild.py`:

```python
# Add to Guild class
tracked_characters = relationship("UserTrackedCharacter", back_populates="guild", cascade="all, delete-orphan")
```

**Step 3: Update models __init__.py**

Add to `services/guild-api/app/models/__init__.py`:

```python
from app.models.user_tracked_character import UserTrackedCharacter
```

**Step 4: Commit model**

```bash
git add services/guild-api/app/models/user_tracked_character.py \
        services/guild-api/app/models/guild.py \
        services/guild-api/app/models/__init__.py
git commit -m "feat(guild-api): add UserTrackedCharacter model

- Model for tracking user's characters per guild
- Relationship with Guild model
- Support for main character flag

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 4: Create Tracked Characters API Endpoints

**Files:**
- Create: `services/guild-api/app/routes/tracked_characters.py`
- Modify: `services/guild-api/app/__init__.py`

**Step 1: Write failing test for GET tracked characters**

Create `services/guild-api/tests/test_tracked_characters.py`:

```python
"""Tests for tracked characters endpoints"""

import pytest
from app.models import UserTrackedCharacter


def test_get_tracked_characters_empty(client, test_guild, test_user_token):
    """Test getting tracked characters when none exist"""
    response = client.get(
        f'/guilds/{test_guild.id}/tracked-characters',
        headers={'Authorization': f'Bearer {test_user_token}'}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['characters'] == []


def test_add_tracked_character(client, test_guild, test_user_token, test_user):
    """Test adding a tracked character"""
    response = client.patch(
        f'/guilds/{test_guild.id}/tracked-characters',
        headers={'Authorization': f'Bearer {test_user_token}'},
        json={
            'character_name': 'TestChar',
            'realm': 'test-realm',
            'is_main': True,
            'tracked': True,
        }
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['character_name'] == 'TestChar'
    assert data['is_main'] is True
    assert data['tracked'] is True


def test_set_main_character(client, db, test_guild, test_user_token, test_user):
    """Test setting a character as main"""
    # Create two tracked characters
    char1 = UserTrackedCharacter(
        guild_id=test_guild.id,
        bnet_id=test_user.bnet_id,
        character_name='Char1',
        realm='test-realm',
        is_main=True,
        tracked=True,
    )
    char2 = UserTrackedCharacter(
        guild_id=test_guild.id,
        bnet_id=test_user.bnet_id,
        character_name='Char2',
        realm='test-realm',
        is_main=False,
        tracked=True,
    )
    db.session.add_all([char1, char2])
    db.session.commit()

    # Set char2 as main
    response = client.patch(
        f'/guilds/{test_guild.id}/tracked-characters',
        headers={'Authorization': f'Bearer {test_user_token}'},
        json={
            'character_name': 'Char2',
            'realm': 'test-realm',
            'is_main': True,
            'tracked': True,
        }
    )

    assert response.status_code == 200

    # Verify char1 is no longer main
    db.session.refresh(char1)
    assert char1.is_main is False

    # Verify char2 is now main
    db.session.refresh(char2)
    assert char2.is_main is True
```

**Step 2: Run test to verify it fails**

Run: `cd services/guild-api && pytest tests/test_tracked_characters.py -v`
Expected: FAIL - route not found

**Step 3: Implement tracked characters routes**

Create `app/routes/tracked_characters.py`:

```python
"""Tracked characters routes"""

from flask import Blueprint, request, jsonify
from sqlalchemy import and_
from app.middleware.auth import require_auth
from app.middleware.permissions import require_guild_member
from app.models import UserTrackedCharacter
from app import db

bp = Blueprint('tracked_characters', __name__)


@bp.route('/guilds/<guild_id>/tracked-characters', methods=['GET'])
@require_auth
@require_guild_member
def get_tracked_characters(guild_id):
    """Get user's tracked characters for this guild"""
    bnet_id = request.user['bnet_id']

    characters = UserTrackedCharacter.query.filter(
        and_(
            UserTrackedCharacter.guild_id == guild_id,
            UserTrackedCharacter.bnet_id == bnet_id,
            UserTrackedCharacter.tracked == True
        )
    ).all()

    return jsonify({
        'characters': [char.to_dict() for char in characters]
    }), 200


@bp.route('/guilds/<guild_id>/tracked-characters', methods=['PATCH'])
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

    # Find or create character
    character = UserTrackedCharacter.query.filter(
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
        db.session.add(character)

    # If setting as main, unset other mains for this user
    if is_main:
        UserTrackedCharacter.query.filter(
            and_(
                UserTrackedCharacter.guild_id == guild_id,
                UserTrackedCharacter.bnet_id == bnet_id,
                UserTrackedCharacter.id != character.id if character.id else True,
            )
        ).update({'is_main': False})

    db.session.commit()

    return jsonify(character.to_dict()), 200
```

**Step 4: Register blueprint**

Modify `services/guild-api/app/__init__.py` to register blueprint:

```python
from app.routes import tracked_characters
app.register_blueprint(tracked_characters.bp)
```

**Step 5: Run tests to verify they pass**

Run: `cd services/guild-api && pytest tests/test_tracked_characters.py -v`
Expected: PASS - all tests pass

**Step 6: Commit tracked characters API**

```bash
git add services/guild-api/app/routes/tracked_characters.py \
        services/guild-api/tests/test_tracked_characters.py \
        services/guild-api/app/__init__.py
git commit -m "feat(guild-api): add tracked characters API endpoints

- GET /guilds/:id/tracked-characters - list user's tracked characters
- PATCH /guilds/:id/tracked-characters - add/update tracked character
- Auto-unset previous main when setting new main character
- Tests for all endpoints

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Backend - Guild Crest

### Task 5: Add Guild Crest Endpoint to Blizzard Service

**Files:**
- Modify: `services/guild-api/app/services/blizzard_service.py`
- Create: `services/guild-api/tests/test_blizzard_service.py`

**Step 1: Write failing test for fetch_guild_crest**

Create test file:

```python
"""Tests for Blizzard service"""

import pytest
from unittest.mock import patch, MagicMock
from app.services.blizzard_service import fetch_guild_crest, BlizzardAPIError


def test_fetch_guild_crest_success():
    """Test successful guild crest fetch"""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'crest': {
            'emblem': {
                'id': 123,
                'color': {'rgba': {'r': 255, 'g': 0, 'b': 0, 'a': 255}}
            },
            'border': {
                'id': 5,
                'color': {'rgba': {'r': 0, 'g': 0, 'b': 0, 'a': 255}}
            },
            'background': {
                'color': {'rgba': {'r': 255, 'g': 255, 'b': 255, 'a': 255}}
            }
        }
    }

    with patch('requests.get', return_value=mock_response):
        result = fetch_guild_crest('test_token', 'test-guild', 'test-realm')

    assert result['emblem_id'] == 123
    assert result['emblem_color'] == {'r': 255, 'g': 0, 'b': 0, 'a': 255}
    assert result['border_id'] == 5
    assert result['render_url'] == 'https://render.worldofwarcraft.com/us/guild/crest/emblem/123.png'


def test_fetch_guild_crest_not_found():
    """Test guild crest fetch when guild not found"""
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_response.raise_for_status.side_effect = Exception('Not found')

    with patch('requests.get', return_value=mock_response):
        result = fetch_guild_crest('test_token', 'test-guild', 'test-realm')

    assert result is None
```

**Step 2: Run test to verify it fails**

Run: `cd services/guild-api && pytest tests/test_blizzard_service.py::test_fetch_guild_crest_success -v`
Expected: FAIL - function not defined

**Step 3: Implement fetch_guild_crest function**

Add to `blizzard_service.py`:

```python
@with_rate_limit_and_circuit_breaker
def fetch_guild_crest(
    access_token: str, guild_name: str, realm_slug: str, region: str = "us"
) -> Optional[Dict]:
    """
    Fetch guild crest/emblem data from Blizzard API

    Args:
        access_token: Blizzard OAuth access token
        guild_name: Guild name
        realm_slug: Realm slug
        region: API region

    Returns:
        Dictionary with emblem_id, colors, and render_url, or None if not found

    Raises:
        BlizzardAPIError: If API call fails
    """
    api_base = get_api_base_url(region)
    guild_lower = guild_name.lower().replace(" ", "-")
    url = f"{api_base}/data/wow/guild/{realm_slug}/{guild_lower}"

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"namespace": f"profile-{region}", "locale": "en_US"}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        crest = data.get("crest")
        if not crest:
            return None

        emblem = crest.get("emblem", {})
        border = crest.get("border", {})
        background = crest.get("background", {})

        emblem_id = emblem.get("id", 0)

        return {
            "emblem_id": emblem_id,
            "emblem_color": emblem.get("color", {}).get("rgba", {}),
            "border_id": border.get("id", 0),
            "border_color": border.get("color", {}).get("rgba", {}),
            "background_color": background.get("color", {}).get("rgba", {}),
            "render_url": f"https://render.worldofwarcraft.com/{region}/guild/crest/emblem/{emblem_id}.png",
        }

    except requests.HTTPError as e:
        if e.response.status_code == 404:
            return None
        current_app.logger.error(f"Failed to fetch guild crest: {e}")
        raise BlizzardAPIError(f"Failed to fetch guild crest: {str(e)}")
    except requests.RequestException as e:
        current_app.logger.error(f"Failed to fetch guild crest: {e}")
        raise BlizzardAPIError(f"Failed to fetch guild crest: {str(e)}")
```

**Step 4: Run tests to verify they pass**

Run: `cd services/guild-api && pytest tests/test_blizzard_service.py -v`
Expected: PASS

**Step 5: Commit guild crest function**

```bash
git add services/guild-api/app/services/blizzard_service.py \
        services/guild-api/tests/test_blizzard_service.py
git commit -m "feat(guild-api): add fetch_guild_crest to Blizzard service

- Fetch guild emblem/crest data from Blizzard API
- Returns emblem ID, colors, and render URL
- Handle 404 gracefully (guild not found)
- Tests for success and not found cases

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 6: Add Guild Crest to Guild Model

**Files:**
- Create: `services/guild-api/alembic/versions/004_add_guild_crest.py`
- Modify: `services/guild-api/app/models/guild.py`

**Step 1: Create migration to add crest fields to guilds table**

Create migration:

```python
"""Add guild crest fields

Revision ID: 004
Revises: 003
Create Date: 2026-02-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('guilds', sa.Column('crest_data', JSONB, nullable=True))
    op.add_column('guilds', sa.Column('crest_updated_at', sa.DateTime, nullable=True))


def downgrade():
    op.drop_column('guilds', 'crest_updated_at')
    op.drop_column('guilds', 'crest_data')
```

**Step 2: Run migration**

Run:
```bash
cd services/guild-api
alembic upgrade head
```
Expected: Migration runs successfully

**Step 3: Update Guild model**

Modify `app/models/guild.py`:

```python
from sqlalchemy.dialects.postgresql import JSONB

# Add to Guild class
crest_data = Column(JSONB, nullable=True)
crest_updated_at = Column(DateTime, nullable=True)

def to_dict(self):
    """Convert to dictionary"""
    return {
        'id': str(self.id),
        'name': self.name,
        'realm': self.realm,
        'gm_bnet_id': self.gm_bnet_id,
        'crest_data': self.crest_data,  # Add this
        'created_at': self.created_at.isoformat(),
        'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
    }
```

**Step 4: Commit crest fields**

```bash
git add services/guild-api/alembic/versions/004_add_guild_crest.py \
        services/guild-api/app/models/guild.py
git commit -m "feat(guild-api): add crest_data to Guild model

- Store guild emblem/crest as JSONB
- Track last update timestamp for cache invalidation
- Include crest_data in to_dict serialization

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 7: Add Guild Crest Sync Endpoint

**Files:**
- Modify: `services/guild-api/app/routes/guilds.py`
- Create: `services/guild-api/tests/test_guild_crest.py`

**Step 1: Write test for crest sync endpoint**

Create test file:

```python
"""Tests for guild crest sync"""

import pytest
from unittest.mock import patch
from datetime import datetime


def test_sync_guild_crest_success(client, test_guild, test_gm_token):
    """Test syncing guild crest from Blizzard API"""
    mock_crest_data = {
        'emblem_id': 123,
        'emblem_color': {'r': 255, 'g': 0, 'b': 0, 'a': 255},
        'border_id': 5,
        'border_color': {'r': 0, 'g': 0, 'b': 0, 'a': 255},
        'background_color': {'r': 255, 'g': 255, 'b': 255, 'a': 255},
        'render_url': 'https://render.worldofwarcraft.com/us/guild/crest/emblem/123.png',
    }

    with patch('app.services.blizzard_service.fetch_guild_crest', return_value=mock_crest_data):
        response = client.post(
            f'/guilds/{test_guild.id}/sync-crest',
            headers={'Authorization': f'Bearer {test_gm_token}'}
        )

    assert response.status_code == 200
    data = response.get_json()
    assert data['crest_data']['emblem_id'] == 123
    assert 'crest_updated_at' in data


def test_sync_guild_crest_not_found(client, test_guild, test_gm_token):
    """Test syncing crest when guild not found in Blizzard API"""
    with patch('app.services.blizzard_service.fetch_guild_crest', return_value=None):
        response = client.post(
            f'/guilds/{test_guild.id}/sync-crest',
            headers={'Authorization': f'Bearer {test_gm_token}'}
        )

    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data
```

**Step 2: Run test to verify it fails**

Run: `cd services/guild-api && pytest tests/test_guild_crest.py -v`
Expected: FAIL - route not found

**Step 3: Add sync-crest endpoint to guilds routes**

Add to `app/routes/guilds.py`:

```python
from datetime import datetime
from app.services.blizzard_service import fetch_guild_crest

@bp.route('/guilds/<guild_id>/sync-crest', methods=['POST'])
@require_auth
@require_guild_access('progress', min_rank=0)  # GM only
def sync_guild_crest(guild_id):
    """Sync guild crest from Blizzard API"""
    guild = Guild.query.get(guild_id)
    if not guild:
        return jsonify({'error': 'Guild not found'}), 404

    # Get access token from request user
    access_token = request.user.get('access_token')
    if not access_token:
        return jsonify({'error': 'No Blizzard access token'}), 401

    # Fetch crest from Blizzard
    crest_data = fetch_guild_crest(
        access_token,
        guild.name,
        guild.realm,
        region='us'  # TODO: Make region configurable
    )

    if not crest_data:
        return jsonify({'error': 'Guild crest not found on Blizzard API'}), 404

    # Update guild
    guild.crest_data = crest_data
    guild.crest_updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(guild.to_dict()), 200
```

**Step 4: Run tests to verify they pass**

Run: `cd services/guild-api && pytest tests/test_guild_crest.py -v`
Expected: PASS

**Step 5: Commit crest sync endpoint**

```bash
git add services/guild-api/app/routes/guilds.py \
        services/guild-api/tests/test_guild_crest.py
git commit -m "feat(guild-api): add guild crest sync endpoint

- POST /guilds/:id/sync-crest - fetch and store crest from Blizzard
- GM-only endpoint (requires rank 0)
- Updates crest_data and crest_updated_at on guild
- Tests for success and not found cases

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Frontend - DashboardHeader Component

### Task 8: Create DashboardHeader Component

**Files:**
- Create: `apps/web/app/components/dashboard-header.tsx`
- Create: `apps/web/app/components/dashboard-header.module.css`

**Step 1: Create basic DashboardHeader component**

Create `dashboard-header.tsx`:

```typescript
'use client';

import React from 'react';
import { Badge, BadgeHeader, BadgeBody, BadgeFooter } from '@hool/design-system';
import type { Guild } from '../lib/types';
import styles from './dashboard-header.module.css';

export interface DashboardHeaderProps {
  guild: Guild;
  userRole: 'gm' | 'officer' | 'raider';
  onNavigate?: (section: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  guild,
  userRole,
  onNavigate,
}) => {
  const isGmOrOfficer = userRole === 'gm' || userRole === 'officer';

  const renderGuildEmblem = () => {
    if (guild.crest_data?.render_url) {
      return (
        <img
          src={guild.crest_data.render_url}
          alt={`${guild.name} emblem`}
          className={styles.emblem}
        />
      );
    }
    // Fallback: guild initial
    return (
      <div className={styles.emblemFallback}>
        {guild.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Badge
        variant="primary"
        size="md"
        orientation="horizontal"
        profileIcon={renderGuildEmblem()}
        onClick={() => onNavigate?.('guild-info')}
      >
        <BadgeHeader>
          <div className={styles.guildName}>{guild.name}</div>
          <div className={styles.realm}>{guild.realm}</div>
        </BadgeHeader>

        <BadgeBody>
          {isGmOrOfficer ? (
            <div className={styles.teamView}>
              <div className={styles.label}>Team Overview</div>
              <div className={styles.placeholder}>Stats loading...</div>
            </div>
          ) : (
            <div className={styles.characterView}>
              <div className={styles.placeholder}>Character stats loading...</div>
            </div>
          )}
        </BadgeBody>

        <BadgeFooter>
          {isGmOrOfficer && (
            <div className={styles.viewToggle}>
              <button className={styles.arrow}>←</button>
              <div className={styles.dots}>•○</div>
              <button className={styles.arrow}>→</button>
            </div>
          )}
        </BadgeFooter>
      </Badge>
    </div>
  );
};
```

**Step 2: Create CSS module**

Create `dashboard-header.module.css`:

```css
.container {
  width: 100%;
  margin-bottom: 2rem;
}

.emblem {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.emblemFallback {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, var(--hool-purple-500), var(--hool-purple-700));
  color: white;
  border-radius: 8px;
}

.guildName {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--hool-ui-white);
  line-height: 1.2;
}

.realm {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
}

.teamView,
.characterView {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.placeholder {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.viewToggle {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.arrow {
  background: none;
  border: none;
  color: var(--hool-ui-white);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: opacity 0.2s;
}

.arrow:hover {
  opacity: 0.7;
}

.dots {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.25rem;
}
```

**Step 3: Use DashboardHeader in guild dashboard page**

Modify `apps/web/app/(platform)/guilds/[guildId]/page.tsx`:

```typescript
import { DashboardHeader } from '../../../components/dashboard-header';

export default function GuildDashboardPage() {
  const { guild, memberCount, permissions, canAccess, guildId, isGM, isOfficer } = useGuild();
  const router = useRouter();

  const userRole = isGM ? 'gm' : isOfficer ? 'officer' : 'raider';

  const handleNavigate = (section: string) => {
    console.log('Navigate to:', section);
    // TODO: Implement navigation
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Dashboard Header */}
      {guild && (
        <DashboardHeader
          guild={guild}
          userRole={userRole}
          onNavigate={handleNavigate}
        />
      )}

      {/* Rest of dashboard... */}
      {/* ... existing code ... */}
    </div>
  );
}
```

**Step 4: Test in browser**

Run: `pnpm dev`
Expected: Navigate to guild dashboard, header displays with guild name, realm, and placeholder content

**Step 5: Commit DashboardHeader component**

```bash
git add apps/web/app/components/dashboard-header.tsx \
        apps/web/app/components/dashboard-header.module.css \
        apps/web/app/(platform)/guilds/[guildId]/page.tsx
git commit -m "feat(web): add DashboardHeader component skeleton

- Full-width horizontal badge with guild info
- Role-specific layout (GM/Officer vs Raider)
- Guild emblem display with fallback
- View toggle UI for GM/Officers
- Placeholder content for stats (to be implemented)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: Character Tracking Frontend

### Task 9: Add Character Tracking Hook

**Files:**
- Create: `apps/web/app/lib/use-tracked-characters.ts`

**Step 1: Create useTrackedCharacters hook**

Create hook file:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

export interface TrackedCharacter {
  id: string;
  guild_id: string;
  bnet_id: number;
  character_name: string;
  realm: string;
  is_main: boolean;
  tracked: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseTrackedCharactersResult {
  characters: TrackedCharacter[];
  mainCharacter: TrackedCharacter | null;
  isLoading: boolean;
  error: string | null;
  addCharacter: (name: string, realm: string, isMain?: boolean) => Promise<void>;
  setMainCharacter: (name: string, realm: string) => Promise<void>;
  removeCharacter: (name: string, realm: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTrackedCharacters(guildId: string): UseTrackedCharactersResult {
  const [characters, setCharacters] = useState<TrackedCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ characters: TrackedCharacter[] }>(
        `/guilds/${guildId}/tracked-characters`
      );
      setCharacters(response.characters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch characters');
    } finally {
      setIsLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const addCharacter = useCallback(
    async (name: string, realm: string, isMain = false) => {
      try {
        const response = await api.patch<TrackedCharacter>(
          `/guilds/${guildId}/tracked-characters`,
          {
            character_name: name,
            realm,
            is_main: isMain,
            tracked: true,
          }
        );

        // Update local state
        setCharacters((prev) => {
          const existing = prev.find(
            (c) => c.character_name === name && c.realm === realm
          );
          if (existing) {
            return prev.map((c) =>
              c.character_name === name && c.realm === realm
                ? response
                : isMain
                  ? { ...c, is_main: false }
                  : c
            );
          }
          return [...prev, response];
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add character');
        throw err;
      }
    },
    [guildId]
  );

  const setMainCharacter = useCallback(
    async (name: string, realm: string) => {
      await addCharacter(name, realm, true);
    },
    [addCharacter]
  );

  const removeCharacter = useCallback(
    async (name: string, realm: string) => {
      try {
        await api.patch(`/guilds/${guildId}/tracked-characters`, {
          character_name: name,
          realm,
          tracked: false,
        });

        // Update local state
        setCharacters((prev) =>
          prev.filter((c) => !(c.character_name === name && c.realm === realm))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove character');
        throw err;
      }
    },
    [guildId]
  );

  const mainCharacter = characters.find((c) => c.is_main) || null;

  return {
    characters,
    mainCharacter,
    isLoading,
    error,
    addCharacter,
    setMainCharacter,
    removeCharacter,
    refetch: fetchCharacters,
  };
}
```

**Step 2: Test hook (manual browser test)**

Run: `pnpm dev`
Expected: Hook can be imported and used (will test in next task with UI)

**Step 3: Commit hook**

```bash
git add apps/web/app/lib/use-tracked-characters.ts
git commit -m "feat(web): add useTrackedCharacters hook

- Fetch user's tracked characters for a guild
- Add/remove characters from tracking
- Set main character (auto-unsets others)
- Optimistic local state updates

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 10: Create Character Selector Component

**Files:**
- Create: `apps/web/app/components/character-selector.tsx`
- Create: `apps/web/app/components/character-selector.module.css`

**Step 1: Create CharacterSelector component**

Create component:

```typescript
'use client';

import React, { useState } from 'react';
import { Icon } from '@hool/design-system';
import type { TrackedCharacter } from '../lib/use-tracked-characters';
import styles from './character-selector.module.css';

export interface BlizzardCharacter {
  name: string;
  realm: string;
  level: number;
  playable_class: string;
  playable_race: string;
  faction: string;
}

export interface CharacterSelectorProps {
  trackedCharacters: TrackedCharacter[];
  availableCharacters: BlizzardCharacter[];
  onAddCharacter: (name: string, realm: string) => Promise<void>;
  onRemoveCharacter: (name: string, realm: string) => Promise<void>;
  onSetMain: (name: string, realm: string) => Promise<void>;
  onClose: () => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  trackedCharacters,
  availableCharacters,
  onAddCharacter,
  onRemoveCharacter,
  onSetMain,
  onClose,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const isTracked = (name: string, realm: string) =>
    trackedCharacters.some(
      (c) => c.character_name === name && c.realm === realm
    );

  const isMain = (name: string, realm: string) =>
    trackedCharacters.some(
      (c) => c.character_name === name && c.realm === realm && c.is_main
    );

  const handleToggleTracked = async (char: BlizzardCharacter) => {
    const key = `${char.name}-${char.realm}`;
    setLoading(key);

    try {
      if (isTracked(char.name, char.realm)) {
        await onRemoveCharacter(char.name, char.realm);
      } else {
        await onAddCharacter(char.name, char.realm);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSetMain = async (char: BlizzardCharacter) => {
    const key = `${char.name}-${char.realm}`;
    setLoading(key);

    try {
      await onSetMain(char.name, char.realm);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Select Characters</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className={styles.list}>
          {availableCharacters.map((char) => {
            const tracked = isTracked(char.name, char.realm);
            const main = isMain(char.name, char.realm);
            const key = `${char.name}-${char.realm}`;
            const isLoading = loading === key;

            return (
              <div key={key} className={styles.characterRow}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={tracked}
                    onChange={() => handleToggleTracked(char)}
                    disabled={isLoading}
                  />
                  <span className={styles.characterInfo}>
                    <span className={styles.name}>{char.name}</span>
                    <span className={styles.details}>
                      {char.level} {char.playable_class} - {char.realm}
                    </span>
                  </span>
                </label>

                {tracked && (
                  <button
                    className={`${styles.starButton} ${main ? styles.mainStar : ''}`}
                    onClick={() => handleSetMain(char)}
                    disabled={isLoading || main}
                    title={main ? 'Main character' : 'Set as main'}
                  >
                    <Icon name="star" size={20} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

**Step 2: Create CSS module**

Create `character-selector.module.css`:

```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--hool-bg-primary);
  border: 2px solid var(--hool-border-primary);
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--hool-border-secondary);
}

.header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--hool-ui-white);
}

.closeButton {
  background: none;
  border: none;
  color: var(--hool-ui-white);
  cursor: pointer;
  padding: 0.25rem;
  transition: opacity 0.2s;
}

.closeButton:hover {
  opacity: 0.7;
}

.list {
  overflow-y: auto;
  padding: 1rem;
  flex: 1;
}

.characterRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid var(--hool-border-secondary);
  transition: background 0.2s;
}

.characterRow:hover {
  background: rgba(255, 255, 255, 0.05);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
}

.checkbox input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.characterInfo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--hool-ui-white);
}

.details {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.6);
}

.starButton {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s;
}

.starButton:hover:not(:disabled) {
  color: #fbbf24;
  transform: scale(1.1);
}

.starButton:disabled {
  cursor: not-allowed;
}

.mainStar {
  color: #fbbf24;
}
```

**Step 3: Commit CharacterSelector component**

```bash
git add apps/web/app/components/character-selector.tsx \
        apps/web/app/components/character-selector.module.css
git commit -m "feat(web): add CharacterSelector component

- Modal for selecting which characters to track
- Checkbox to add/remove characters
- Star button to set main character
- Display character level, class, realm
- Loading states during API calls

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: Integration & Polish

### Task 11: Integrate Character Selector into DashboardHeader

**Files:**
- Modify: `apps/web/app/components/dashboard-header.tsx`
- Modify: `apps/web/app/components/dashboard-header.module.css`

**Step 1: Add character selector to DashboardHeader**

Modify `dashboard-header.tsx`:

```typescript
import { useState } from 'react';
import { CharacterSelector } from './character-selector';
import { useTrackedCharacters } from '../lib/use-tracked-characters';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  guild,
  userRole,
  onNavigate,
}) => {
  const isGmOrOfficer = userRole === 'gm' || userRole === 'officer';
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [viewMode, setViewMode] = useState<'team' | 'personal'>(
    isGmOrOfficer ? 'team' : 'personal'
  );

  const {
    characters: trackedCharacters,
    mainCharacter,
    addCharacter,
    removeCharacter,
    setMainCharacter,
  } = useTrackedCharacters(guild.id);

  // TODO: Fetch available characters from Blizzard API
  const availableCharacters = [];

  const toggleView = () => {
    setViewMode((prev) => (prev === 'team' ? 'personal' : 'team'));
  };

  const handleOpenCharacterSelector = () => {
    setShowCharacterSelector(true);
  };

  const renderStats = () => {
    if (isGmOrOfficer && viewMode === 'team') {
      return (
        <div className={styles.teamView}>
          <div className={styles.label}>Team Overview</div>
          <div className={styles.stat}>Avg ilvl: 645 ↑</div>
          <div className={styles.stat}>32/45 on track</div>
          <div className={styles.warning}>⚠️ 8 need attention</div>
        </div>
      );
    }

    // Personal view (or raider)
    return (
      <div className={styles.characterView}>
        {mainCharacter ? (
          <>
            <div className={styles.characterName}>{mainCharacter.character_name}</div>
            <div className={styles.ilvl}>650 ilvl</div>
            <div className={styles.progress}>Weekly: 75%</div>
          </>
        ) : (
          <div className={styles.placeholder}>
            <button onClick={handleOpenCharacterSelector}>
              Add your characters
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={styles.container}>
        <Badge
          variant="primary"
          size="md"
          orientation="horizontal"
          profileIcon={renderGuildEmblem()}
          onClick={() => onNavigate?.('guild-info')}
        >
          <BadgeHeader>
            <div className={styles.guildName}>{guild.name}</div>
            <div className={styles.realm}>{guild.realm}</div>
          </BadgeHeader>

          <BadgeBody onClick={handleOpenCharacterSelector}>
            {renderStats()}
          </BadgeBody>

          <BadgeFooter>
            {isGmOrOfficer && (
              <div className={styles.viewToggle}>
                <button className={styles.arrow} onClick={toggleView}>
                  ←
                </button>
                <div className={styles.dots}>
                  {viewMode === 'team' ? '•○' : '○•'}
                </div>
                <button className={styles.arrow} onClick={toggleView}>
                  →
                </button>
              </div>
            )}
          </BadgeFooter>
        </Badge>
      </div>

      {showCharacterSelector && (
        <CharacterSelector
          trackedCharacters={trackedCharacters}
          availableCharacters={availableCharacters}
          onAddCharacter={addCharacter}
          onRemoveCharacter={removeCharacter}
          onSetMain={setMainCharacter}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}
    </>
  );
};
```

**Step 2: Add missing CSS classes**

Add to `dashboard-header.module.css`:

```css
.stat {
  font-size: 0.875rem;
  color: var(--hool-ui-white);
}

.warning {
  font-size: 0.875rem;
  color: #ef4444;
  font-weight: 700;
}

.characterName {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--hool-ui-white);
}

.ilvl {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--hool-ui-white);
}

.progress {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}
```

**Step 3: Test in browser**

Run: `pnpm dev`
Expected:
- Click on badge body opens character selector
- GM/Officers can toggle between Team and Personal views
- Character selector shows available characters (empty for now)

**Step 4: Commit integration**

```bash
git add apps/web/app/components/dashboard-header.tsx \
        apps/web/app/components/dashboard-header.module.css
git commit -m "feat(web): integrate character selector into DashboardHeader

- Click badge body to open character selector
- GM/Officers can toggle between team and personal views
- Display main character stats in personal view
- Prompt to add characters if none tracked
- View indicator dots update based on current view

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Next Steps (Future Implementation)

The following tasks remain but are not part of this initial implementation plan:

1. **Fetch User Characters from Blizzard API**
   - Add endpoint to fetch user's WoW characters
   - Display in CharacterSelector dropdown

2. **Dashboard Stats API**
   - Implement `/guilds/:id/dashboard-stats` endpoint
   - Calculate team averages, vault progress, weekly completion
   - "Falling behind" detection logic

3. **Real Character & Vault Data**
   - Fetch actual character ilvl from progress-api
   - Display real vault slot status
   - Weekly task completion percentage

4. **Action Modal for "Falling Behind" Members**
   - Click warning badge → modal with member list
   - Filter by issue type
   - Copy to clipboard for Discord

5. **Mobile Responsive Layout**
   - Stack badge sections vertically on mobile
   - Adjust emblem size
   - Touch-friendly interactions

---

## Testing Checklist

- [ ] Badge horizontal variant displays correctly in Storybook
- [ ] DashboardHeader renders with guild info
- [ ] Guild emblem displays (or fallback)
- [ ] Character selector opens/closes
- [ ] Can add/remove tracked characters
- [ ] Can set main character (star icon)
- [ ] Only one character can be main at a time
- [ ] GM/Officers see view toggle
- [ ] View toggle switches between Team and Personal
- [ ] Raiders only see Personal view
- [ ] All API endpoints have tests
- [ ] Migration runs successfully
- [ ] Guild crest syncs from Blizzard API

---

## Deployment Notes

1. Run migrations on staging first:
   ```bash
   cd services/guild-api
   alembic upgrade head
   ```

2. Sync guild crests for existing guilds (one-time):
   ```bash
   # TODO: Create admin script to bulk sync crests
   ```

3. Deploy frontend and backend together (feature requires both)

4. Monitor for Blizzard API rate limits

5. Consider caching guild crests (rarely change)
