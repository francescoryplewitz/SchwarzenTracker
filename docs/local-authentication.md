# Local Authentication (Development Mode)

This documentation explains how local authentication works in development mode.

## Overview

In development mode (`NODE_ENV=development`), a special authentication system is activated that allows you to:
- Switch between different users
- Freely assign and test roles
- Work without OAuth login

**Important**: This system is only active in development mode. In production, OAuth (Cognito) is used.

## Quick Start

### 1. Start Server
```bash
npm run start:local
```

### 2. Open DevConfig Page
Navigate to the developer configuration page in your browser.

### 3. Select User
- Choose a user from the dropdown
- The change is automatically saved

### 4. Activate Roles
- Click on the role toggles (admin, user)
- Multiple roles can be active simultaneously
- Changes are saved immediately

## Available Users

By default, two users are preconfigured:

| ID | Name | Email | Default Roles |
|----|------|-------|---------------|
| 1 | Standard User | user@example.com | user |
| 2 | Admin User | admin@example.com | admin, user |

### Adding More Users

To add new test users:

1. Edit `srv/data/structuredata/user.json`
2. Add a new entry:
```json
{
  "id": 3,
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "roles": ["user"],
  "externalId": "test-001",
  "isActive": true,
  "filterSettings": {}
}
```
3. Run `npm run set:userdata`

## Roles

### Available Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to the system |
| `user` | Standard user access |

### Role Behavior

- Roles from DevConfig override database roles
- The admin user should have both roles (`admin` + `user`) to use all features
- Without active roles, protected routes are blocked

## Technical Details

### Session Storage
- Configuration is stored in the session
- Survives page refreshes
- Expires after 24 hours
- Server restart deletes all sessions

### Request Flow

```
1. You select User + Roles in DevConfig
2. POST /dev/config saves to Session
3. On each request:
   - dev-auth middleware reads Session
   - Fetches User from database
   - Sets req.user with Session roles
4. authorize() middleware checks req.user.roles
```

### Important Files

| File | Description |
|------|-------------|
| `srv/server/authentication/dev-auth.js` | Dev-Auth Middleware |
| `srv/routes/dev.js` | API Routes (/dev/*) |
| `srv/services/dev.js` | Business Logic |
| `frontend/src/pages/DevConfigPage.vue` | UI Component |

## API Endpoints

These endpoints only exist in development mode.

### GET /dev/users
Returns all available users.

**Response:**
```json
[
  { "id": 1, "firstName": "Standard", "lastName": "User", "email": "user@example.com" },
  { "id": 2, "firstName": "Admin", "lastName": "User", "email": "admin@example.com" }
]
```

### GET /dev/config
Returns the current dev configuration.

**Response:**
```json
{
  "userId": 1,
  "roles": ["user"]
}
```

### POST /dev/config
Saves a new dev configuration.

**Request Body:**
```json
{
  "userId": 2,
  "roles": ["admin", "user"]
}
```

**Response:** Same as Request Body

## Troubleshooting

### Problem: "UNAUTHORIZED" on API calls
**Solution:** Make sure you have activated the required role. Most routes require at least the `user` role.

### Problem: User not found
**Solution:**
1. Check if the user exists in the database
2. Run `npm run set:userdata` to load seed data

### Problem: Configuration is lost
**Causes:**
- Server was restarted (session deleted)
- 24 hour session timeout reached

**Solution:** Configure user and roles again in DevConfig.

### Problem: DevConfig page doesn't load users
**Solution:**
1. Check if the server is running
2. Check the browser console for errors
3. Make sure `NODE_ENV=development` is set

## Difference to Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Authentication | DevConfig UI | OAuth (Cognito) |
| Role Source | Session | Cognito Groups |
| /dev/* Endpoints | Available | Disabled |
| Session Storage | In-Memory | Persistent |
