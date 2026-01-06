# Local Development Authentication Plan

## Goal
Enable AI agents to access the application without basic auth barriers while allowing dynamic user/role switching for testing different scenarios.

## Solution: HTTP Headers + Query Parameters

### Recommended Approach
**Primary Method**: Custom HTTP headers (AI-friendly, clean)
**Fallback Method**: Query parameters (browser-friendly)

This combination provides:
- Easy programmatic access for AI agents via headers
- Simple manual testing via URL query parameters
- Dynamic user ID and role switching per request
- No changes to production OAuth flow

---

## Implementation

### 1. Create New Development Auth Middleware

**File**: `/workspaces/base-expressjs-vue/srv/server/authentication/dev-auth.js` (NEW)

**Key Features**:
- Parses user settings from `X-Dev-User-Id` and `X-Dev-User-Roles` headers
- Falls back to `?devUserId=N&devUserRoles=role1,role2` query params
- Fetches user from database by ID
- Overrides `req.user` with custom roles array (not DB roles)
- Only active when `NODE_ENV === 'development'`
- Defaults to user ID 1 with empty roles if no params provided
- Supports special value `clear` to test unauthenticated state

**Core Logic**:
```javascript
const registerDevAuth = (app) => {
  // Only enable in development
  if (process.env.NODE_ENV !== 'development') return

  app.use(async (req, res, next) => {
    // Parse headers (priority 1) or query params (priority 2)
    const userId = req.headers['x-dev-user-id'] || req.query.devUserId
    const roles = req.headers['x-dev-user-roles'] || req.query.devUserRoles

    // Special case: clear authentication
    if (userId === 'clear') {
      req.user = undefined
      req.session.user = undefined
      return next()
    }

    // Use session user if no dev params
    if (!userId && req.session.user) {
      req.user = req.session.user
      return next()
    }

    // Fetch user from DB and set custom roles
    const id = parseInt(userId || '1', 10)
    const parsedRoles = roles ? roles.split(',').map(r => r.trim()) : []

    const dbUser = await prisma.User.findUnique({ where: { id } })
    if (dbUser) {
      req.user = {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        externalId: dbUser.externalId,
        roles: parsedRoles  // Override with provided roles
      }
      req.session.user = req.user
    }

    next()
  })
}

module.exports = registerDevAuth
```

### 2. Register Middleware in Server

**File**: `/workspaces/base-expressjs-vue/srv/server.js`

**Changes**:
```javascript
// Line 19: Add import (after line 18)
const registerDevAuth = require('./server/authentication/dev-auth')

// Lines 32-36: Update middleware registration
registerProduction(app)
registerHeaders(app)
registerSession(app)
registerAuthentication(app)  // UNCOMMENT - enables passport initialization
registerDevAuth(app)          // ADD - new dev auth middleware
```

**Middleware Order** (critical):
1. Production static files
2. CORS/security headers
3. Session initialization
4. Passport initialization (OAuth in production only)
5. Dev auth (development only) ← NEW
6. Routes (registered in listen callback)

### 3. Update Authentication Index (Optional)

**File**: `/workspaces/base-expressjs-vue/srv/server/authentication/index.js`

Add clarifying comment explaining that OAuth only runs in production/ui-tests, while dev-auth handles development environment.

---

## Usage Examples

### AI Agent - cURL with Headers (Recommended)
```bash
# As user ID 1 with admin role
curl -H "X-Dev-User-Id: 1" \
     -H "X-Dev-User-Roles: admin" \
     http://localhost:4004/user/current

# As user ID 2 with multiple roles
curl -H "X-Dev-User-Id: 2" \
     -H "X-Dev-User-Roles: admin,editor,viewer" \
     http://localhost:4004/api/legal-entities

# Test with no roles (authorization fails)
curl -H "X-Dev-User-Id: 3" \
     -H "X-Dev-User-Roles: " \
     http://localhost:4004/api/protected

# Test unauthenticated state
curl -H "X-Dev-User-Id: clear" \
     http://localhost:4004/user/current
```

### AI Agent - Python
```python
import requests

headers = {
    'X-Dev-User-Id': '1',
    'X-Dev-User-Roles': 'admin,editor'
}
response = requests.get('http://localhost:4004/user/current', headers=headers)
```

### Browser - Query Parameters
```
http://localhost:4004/user/current?devUserId=1&devUserRoles=admin

http://localhost:4004/api/legal-entities?devUserId=2&devUserRoles=admin,editor

http://localhost:4004/?devUserId=clear
```

---

## req.user Object Structure

The middleware constructs `req.user` with these properties:

```javascript
{
  id: number,              // From database (REQUIRED)
  roles: string[],         // From header/query param (REQUIRED)
  firstName: string,       // From database
  lastName: string,        // From database
  email: string,          // From database
  externalId: string      // From database
}
```

**Critical Properties**:
- `id` - Used in srv/server.js:59, srv/services/legal-entity.js:20, 281
- `roles` - Used in srv/server/authentication/authorization.js for permission checks

---

## Edge Cases Handled

1. **User ID doesn't exist**: Logs warning, `req.user` stays undefined, request proceeds as unauthenticated
2. **No roles specified**: Defaults to empty array `[]`
3. **Invalid roles**: Authorization middleware handles rejection with 403
4. **Session persistence**: If no dev params, uses existing session user
5. **Clear authentication**: Use `X-Dev-User-Id: clear` to test unauthenticated state

---

## Production Safety

✅ **Environment-locked**: Only runs when `NODE_ENV === 'development'`
✅ **No config changes**: Uses existing environment variables
✅ **OAuth unaffected**: Production still uses Cognito OAuth
✅ **Clear headers**: `X-Dev-*` prefix marks development-only
✅ **No database changes**: Works with existing User schema

---

## Testing Strategy

### Test User Scenarios
```bash
# Scenario 1: Admin user
X-Dev-User-Id: 1
X-Dev-User-Roles: admin

# Scenario 2: Editor with limited permissions
X-Dev-User-Id: 2
X-Dev-User-Roles: editor

# Scenario 3: Viewer (read-only)
X-Dev-User-Id: 3
X-Dev-User-Roles: viewer

# Scenario 4: Multiple roles
X-Dev-User-Id: 1
X-Dev-User-Roles: admin,editor,viewer

# Scenario 5: No permissions
X-Dev-User-Id: 4
X-Dev-User-Roles:

# Scenario 6: Unauthenticated
X-Dev-User-Id: clear
```

---

## Files to Create/Modify

### NEW FILES
1. `/workspaces/base-expressjs-vue/srv/server/authentication/dev-auth.js` (~200 lines)

### MODIFIED FILES
1. `/workspaces/base-expressjs-vue/srv/server.js`
   - Line 19: Add `const registerDevAuth = require('./server/authentication/dev-auth')`
   - Line 35: Uncomment `registerAuthentication(app)`
   - Line 36: Add `registerDevAuth(app)`

2. `/workspaces/base-expressjs-vue/srv/server/authentication/index.js` (optional)
   - Add clarifying comments about dev/production behavior

### NO CHANGES NEEDED
- `.secrets.json` - No configuration changes
- `package.json` - All dependencies already present
- `prisma/schema.prisma` - Existing User model sufficient

---

## Rollback Plan

If issues arise, quick disable:
```javascript
// In srv/server.js:
// registerDevAuth(app)  // COMMENT OUT
```

Complete rollback:
1. Delete `/workspaces/base-expressjs-vue/srv/server/authentication/dev-auth.js`
2. Remove line 19 import from `srv/server.js`
3. Remove line 36 from `srv/server.js`
4. Re-comment line 35 if needed

No database or configuration rollback needed.

---

## Implementation Steps

1. Create `dev-auth.js` with middleware logic
2. Update `server.js` to import and register middleware
3. Test with curl/Postman using headers
4. Test with browser using query params
5. Verify authorization works with different roles
6. Verify unauthenticated state with "clear"
7. Confirm production environment is unaffected
