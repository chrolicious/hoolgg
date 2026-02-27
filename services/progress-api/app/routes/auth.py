"""Authentication routes - Blizzard OAuth, JWT tokens, logout"""

from flask import Blueprint, request, redirect, jsonify, current_app, make_response
import requests
import secrets
from urllib.parse import urlencode
from datetime import datetime
from app.services.jwt_service import (
    generate_access_token,
    generate_refresh_token,
    verify_token,
)
from app.models import get_db
from app.models.user import User

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.route("/login", methods=["GET"])
def login():
    """
    Initiate Blizzard OAuth flow

    Redirects user to Blizzard's OAuth consent screen.
    Generates a state parameter for CSRF protection.
    """
    # Generate random state for CSRF protection
    state = secrets.token_urlsafe(32)

    # Build OAuth authorization URL
    region = current_app.config["BLIZZARD_REGION"]
    client_id = current_app.config["BLIZZARD_CLIENT_ID"]
    redirect_uri = current_app.config["BLIZZARD_REDIRECT_URI"]

    # OAuth URL varies by region
    oauth_base = "https://oauth.battle.net/authorize"

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "wow.profile openid",
        "state": state,
    }

    authorization_url = f"{oauth_base}?{urlencode(params)}"

    # Store state in session/cookie for verification in callback
    response = make_response(redirect(authorization_url))
    response.set_cookie(
        "oauth_state",
        state,
        httponly=True,
        secure=not current_app.config.get("DEBUG"),
        samesite="Lax",
        max_age=600,  # 10 minutes
    )

    return response


@bp.route("/callback", methods=["GET"])
def callback():
    """
    OAuth callback handler

    Receives authorization code from Blizzard, exchanges for access token.
    Fetches user's Bnet account info and creates/updates user record.
    Issues JWT access and refresh tokens.
    """
    # Verify state parameter (CSRF protection)
    state_cookie = request.cookies.get("oauth_state")
    state_param = request.args.get("state")

    if not state_cookie or not state_param or state_cookie != state_param:
        return jsonify({"error": "Invalid state parameter"}), 400

    # Get authorization code
    code = request.args.get("code")
    if not code:
        error = request.args.get("error", "unknown_error")
        error_description = request.args.get("error_description", "No code provided")
        return jsonify({"error": error, "description": error_description}), 400

    # Exchange code for access token
    token_url = "https://oauth.battle.net/token"
    token_data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": current_app.config["BLIZZARD_REDIRECT_URI"],
        "client_id": current_app.config["BLIZZARD_CLIENT_ID"],
        "client_secret": current_app.config["BLIZZARD_CLIENT_SECRET"],
    }

    try:
        token_response = requests.post(token_url, data=token_data, timeout=10)
        token_response.raise_for_status()
        token_json = token_response.json()
        blizzard_access_token = token_json["access_token"]
        blizzard_token_expires_in = token_json.get("expires_in", 86400)
    except requests.RequestException as e:
        current_app.logger.error(f"Failed to exchange code for token: {e}")
        return jsonify({"error": "Failed to obtain access token"}), 500

    # Fetch user info from Blizzard
    userinfo_url = "https://oauth.battle.net/userinfo"
    headers = {"Authorization": f"Bearer {blizzard_access_token}"}

    try:
        userinfo_response = requests.get(userinfo_url, headers=headers, timeout=10)
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()

        bnet_id = userinfo.get("id")
        bnet_username = userinfo.get("battletag")

        if not bnet_id or not bnet_username:
            return jsonify({"error": "Invalid user info from Blizzard"}), 500

    except requests.RequestException as e:
        current_app.logger.error(f"Failed to fetch user info: {e}")
        return jsonify({"error": "Failed to fetch user info"}), 500

    # Create or update user in database (store Blizzard token for character fetching)
    from datetime import timedelta, timezone
    token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=blizzard_token_expires_in)

    db = next(get_db())
    try:
        user = db.query(User).filter(User.bnet_id == bnet_id).first()
        if user:
            user.bnet_username = bnet_username
            user.last_login = datetime.now(timezone.utc)
            user.blizzard_access_token = blizzard_access_token
            user.blizzard_token_expires_at = token_expires_at
        else:
            user = User(
                bnet_id=bnet_id,
                bnet_username=bnet_username,
                blizzard_access_token=blizzard_access_token,
                blizzard_token_expires_at=token_expires_at,
            )
            db.add(user)
        db.commit()
    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Failed to create/update user: {e}")
        return jsonify({"error": "Failed to save user"}), 500
    finally:
        db.close()

    # Generate JWT tokens
    access_token = generate_access_token(bnet_id)
    refresh_token = generate_refresh_token(bnet_id)

    response_data = {
        "bnet_id": bnet_id,
        "bnet_username": bnet_username,
        "message": "Authentication successful",
    }

    # Set tokens as httpOnly cookies
    response = make_response(jsonify(response_data))

    # Clear the state cookie
    response.set_cookie("oauth_state", "", max_age=0)

    # Cookie domain for cross-subdomain auth (e.g., .hool.gg works for dev.hool.gg and api-dev.hool.gg)
    cookie_domain = current_app.config.get("COOKIE_DOMAIN")

    # Set access token cookie (15 minutes)
    response.set_cookie(
        "access_token",
        access_token,
        domain=cookie_domain,
        httponly=True,
        secure=not current_app.config.get("DEBUG"),
        samesite="Lax",
        max_age=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
    )

    # Set refresh token cookie (7 days)
    response.set_cookie(
        "refresh_token",
        refresh_token,
        domain=cookie_domain,
        httponly=True,
        secure=not current_app.config.get("DEBUG"),
        samesite="Lax",
        max_age=current_app.config["JWT_REFRESH_TOKEN_EXPIRES"],
    )

    return response


@bp.route("/refresh", methods=["POST"])
def refresh():
    """
    Refresh access token using refresh token

    Reads refresh token from httpOnly cookie, validates it,
    and issues a new access token.
    """
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        return jsonify({"error": "No refresh token provided"}), 401

    # Verify refresh token
    payload = verify_token(refresh_token, token_type="refresh")

    if not payload:
        return jsonify({"error": "Invalid or expired refresh token"}), 401

    bnet_id = payload.get("bnet_id")
    if not bnet_id:
        return jsonify({"error": "Invalid token payload"}), 401

    # Generate new access token
    new_access_token = generate_access_token(bnet_id)

    response_data = {"message": "Access token refreshed successfully"}
    response = make_response(jsonify(response_data))

    # Cookie domain for cross-subdomain auth
    cookie_domain = current_app.config.get("COOKIE_DOMAIN")

    # Set new access token cookie
    response.set_cookie(
        "access_token",
        new_access_token,
        domain=cookie_domain,
        httponly=True,
        secure=not current_app.config.get("DEBUG"),
        samesite="Lax",
        max_age=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
    )

    return response


@bp.route("/logout", methods=["POST"])
def logout():
    """
    Logout user - clear JWT tokens

    Clears access and refresh token cookies.
    Optionally adds tokens to Redis blacklist for immediate revocation.
    """
    response_data = {"message": "Logged out successfully"}
    response = make_response(jsonify(response_data))

    # Cookie domain for cross-subdomain auth
    cookie_domain = current_app.config.get("COOKIE_DOMAIN")

    # Clear both tokens by setting max_age to 0
    response.set_cookie("access_token", "", domain=cookie_domain, max_age=0)
    response.set_cookie("refresh_token", "", domain=cookie_domain, max_age=0)

    # TODO: Task 0.26 will add Redis blacklist for immediate token revocation
    # For now, cookies are just cleared (tokens still valid until expiry)

    return response


@bp.route("/me", methods=["GET"])
def get_me():
    """
    Get current authenticated user info

    Reads JWT from access_token cookie, validates it, and returns user data.
    """
    access_token = request.cookies.get("access_token")

    if not access_token:
        return jsonify({"error": "Not authenticated"}), 401

    # Verify access token
    payload = verify_token(access_token, token_type="access")

    if not payload:
        return jsonify({"error": "Invalid or expired token"}), 401

    bnet_id = payload.get("bnet_id")
    if not bnet_id:
        return jsonify({"error": "Invalid token payload"}), 401

    # Get user from database
    db = next(get_db())
    try:
        user = db.query(User).filter(User.bnet_id == bnet_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "bnet_id": user.bnet_id,
            "username": user.bnet_username
        })
    finally:
        db.close()


@bp.route("/me/characters", methods=["GET"])
def get_my_bnet_characters():
    """
    Fetch all WoW characters from Battle.net using the stored access token.

    Returns the full character list from the user's Battle.net account.
    If the stored token has expired, returns 401 with a re-auth hint.
    """
    access_token = request.cookies.get("access_token")
    if not access_token:
        return jsonify({"error": "Not authenticated"}), 401

    payload = verify_token(access_token, token_type="access")
    if not payload:
        return jsonify({"error": "Invalid or expired token"}), 401

    bnet_id = payload.get("bnet_id")
    if not bnet_id:
        return jsonify({"error": "Invalid token payload"}), 401

    db = next(get_db())
    try:
        user = db.query(User).filter(User.bnet_id == bnet_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.has_valid_blizzard_token():
            return jsonify({
                "error": "Blizzard token expired",
                "code": "BLIZZARD_TOKEN_EXPIRED",
            }), 401

        region = current_app.config.get("BLIZZARD_REGION", "us")
        characters = _fetch_user_characters(user.blizzard_access_token, region)

        return jsonify({"characters": characters}), 200

    except Exception as e:
        current_app.logger.error(f"Failed to fetch characters for {bnet_id}: {e}")
        return jsonify({"error": "Failed to fetch characters from Blizzard"}), 502

    finally:
        db.close()


def _fetch_user_characters(blizzard_token: str, region: str = "us"):
    """Fetch all WoW characters using a user's OAuth token (not client_credentials)."""
    region_urls = {
        "us": "https://us.api.blizzard.com",
        "eu": "https://eu.api.blizzard.com",
        "kr": "https://kr.api.blizzard.com",
        "tw": "https://tw.api.blizzard.com",
    }
    api_base = region_urls.get(region.lower(), "https://us.api.blizzard.com")
    url = f"{api_base}/profile/user/wow"

    headers = {"Authorization": f"Bearer {blizzard_token}"}
    params = {"namespace": f"profile-{region}", "locale": "en_US"}

    response = requests.get(url, headers=headers, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    characters = []
    for account in data.get("wow_accounts", []):
        for character in account.get("characters", []):
            characters.append({
                "name": character.get("name"),
                "realm": character.get("realm", {}).get("slug"),
                "level": character.get("level"),
                "playable_class": character.get("playable_class", {}).get("name"),
                "playable_race": character.get("playable_race", {}).get("name"),
                "faction": character.get("faction", {}).get("name"),
            })

    return characters
