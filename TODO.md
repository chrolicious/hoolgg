# TODO

## Features

### BiS Tracker - Wowhead Autocomplete
**Priority:** Medium
**Status:** Blocked by CORS

Add Wowhead item autocomplete to BiS tracker:
- Create backend proxy endpoint in progress-api to fetch Wowhead suggestions
- Endpoint: `/api/wowhead/search?q={query}`
- Proxy to `https://www.wowhead.com/search/suggestions?q={query}&type=item`
- Auto-populate item name and ID when selecting from dropdown
- Improves UX by reducing manual entry errors

**Technical approach:**
1. Add `/api/wowhead/search` endpoint in progress-api
2. Use `requests` library to proxy Wowhead API
3. Return JSON with item suggestions
4. Frontend already has structure (reverted in commit 8d537e2)

**Related commits:**
- e928d43 - Initial implementation (reverted)
- 8d537e2 - Revert due to CORS

### Cloudflare CDN Integration
**Priority:** Medium
**Status:** Planned

Add Cloudflare CDN for edge caching and global performance:
- Configure Cloudflare as DNS provider for hool.gg
- Enable CDN/proxy mode for web traffic
- Set up appropriate caching rules for static assets
- Configure Page Rules for API endpoints (bypass cache)
- Enable auto-minification for HTML/CSS/JS
- Consider Cloudflare Workers for advanced edge logic if needed

**Benefits:**
- Faster load times globally (especially for US players)
- DDoS protection and security features
- Reduced load on origin server
- Free tier supports basic needs

**Technical approach:**
1. Point hool.gg nameservers to Cloudflare
2. Set up A records pointing to Hetzner VPS IP
3. Enable "Proxied" mode (orange cloud)
4. Configure caching rules in dashboard
5. Test performance improvements
