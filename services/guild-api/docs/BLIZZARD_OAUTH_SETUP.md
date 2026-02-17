# Blizzard OAuth Setup Guide

This guide walks you through registering your application with Blizzard's OAuth system.

## Step 1: Create a Battle.net Developer Account

1. Go to https://develop.battle.net/
2. Log in with your Battle.net account
3. Accept the API Terms of Service

## Step 2: Create a New Client

1. Navigate to "API Access" in the developer portal
2. Click "Create Client"
3. Fill in the application details:
   - **Client Name**: hool.gg
   - **Redirect URIs**:
     - Development: `http://localhost:3000/auth/callback`
     - Staging: `https://staging.hool.gg/auth/callback`
     - Production: `https://hool.gg/auth/callback`
   - **Intended Use**: Select "Web Application"

## Step 3: Configure OAuth Scopes

Select the following OAuth scopes:
- `wow.profile` - Access to WoW profile information
- `openid` - Basic authentication

## Step 4: Save Credentials

After creating the client, you'll receive:
- **Client ID**: A unique identifier for your application
- **Client Secret**: A secret key (keep this secure!)

## Step 5: Update Environment Variables

Add these to your `.env` file:

```bash
BLIZZARD_CLIENT_ID=your_client_id_here
BLIZZARD_CLIENT_SECRET=your_client_secret_here
BLIZZARD_REDIRECT_URI=https://hool.gg/auth/callback
BLIZZARD_REGION=us  # Options: us, eu, kr, tw, cn
```

## Step 6: Test OAuth Flow

1. Start the guild-api server
2. Navigate to `http://localhost:5000/auth/login`
3. You should be redirected to Blizzard's OAuth consent screen
4. After granting permission, you should be redirected back with a valid token

## API Endpoints

### US Region
- OAuth: `https://oauth.battle.net/`
- API: `https://us.api.blizzard.com/`

### EU Region
- OAuth: `https://oauth.battle.net/`
- API: `https://eu.api.blizzard.com/`

### Asia Regions (KR, TW)
- OAuth: `https://oauth.battle.net/`
- API: `https://kr.api.blizzard.com/` or `https://tw.api.blizzard.com/`

## Rate Limits

- **100 requests per second** per IP address
- **36,000 requests per hour** per client ID
- **100,000 requests per day** per client ID

## Troubleshooting

### Invalid Redirect URI
- Ensure the redirect URI in your `.env` matches exactly what's registered in the developer portal
- Include the protocol (`http://` or `https://`)
- Include the full path (`/auth/callback`)

### Invalid Client Credentials
- Double-check your Client ID and Client Secret
- Ensure there are no extra spaces or line breaks

### Rate Limit Errors
- Implement caching (Redis) to reduce API calls
- Use the batch endpoints where possible
- Respect the rate limit headers in API responses

## Security Best Practices

1. **Never commit credentials to version control**
   - Use `.env` files
   - Add `.env` to `.gitignore`

2. **Use environment-specific credentials**
   - Different Client IDs for dev/staging/prod
   - Different redirect URIs for each environment

3. **Rotate credentials regularly**
   - Change Client Secret every 6-12 months
   - Immediately rotate if credentials are compromised

4. **Validate OAuth state parameter**
   - Prevents CSRF attacks
   - Implemented in the callback handler

## Resources

- [Battle.net Developer Portal](https://develop.battle.net/)
- [OAuth 2.0 Documentation](https://develop.battle.net/documentation/guides/using-oauth)
- [WoW Profile API](https://develop.battle.net/documentation/world-of-warcraft/profile-apis)
