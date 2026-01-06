# Environment Variables

This documentation describes all environment variables required by the application.

## Configuration Architecture

The application loads configuration from:
- `.secrets.json` - Public default values (in Git)
- `.secrets-private.json` - Private values (not in Git, created at runtime)
- `.env` - DATABASE_URL for Prisma

---

## Always Required

### Node Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment: `development`, `test`, `production` | - |

### Database

In `.secrets.json` under `db.*`:

| Variable | Description | Dev Default |
|----------|-------------|-------------|
| `db.type` | Database type | `postgresql` |
| `db.host` | Database host | `localhost` |
| `db.port` | Database port | `5432` |
| `db.database` | Database name | `local` |
| `db.schema` | Schema name | `development` |
| `db.username` | Username | `postgres` |
| `db.password` | Password | `postgres` |

### CORS

| Variable | Description | Dev Default |
|----------|-------------|-------------|
| `corswhitelist` | Array of allowed origins | `["localhost"]` |

### Logging

| Variable | Description | Dev Default |
|----------|-------------|-------------|
| `log.level` | Log level (1=minimal, 2=warn+, 3=debug+) | `3` |

---

## Development Only

| Variable | Description | Default |
|----------|-------------|---------|
| `localFileStorage` | Directory name for local file storage | - |

---

## Production Only

### Server

| Variable | Description |
|----------|-------------|
| `domain` | Application domain (e.g. `https://app.example.com`) |
| `port` | Server port (default: `4004`) |
| `stage` | Environment label |

### CSRF

| Variable | Description |
|----------|-------------|
| `csrfSecret` | Secret for CSRF token generation |

### Authentication (Cognito OAuth)

In `.secrets.json` under `auth.*`:

| Variable | Description |
|----------|-------------|
| `auth.cognitoUrl` | Cognito OAuth provider URL |
| `auth.clientId` | OAuth client ID |
| `auth.clientSecret` | OAuth client secret |
| `auth.callbackURL` | Callback URL after login |

### AWS

In `.secrets.json` under `aws.*`:

| Variable | Description |
|----------|-------------|
| `aws.clientId` | AWS Access Key ID |
| `aws.clientSecret` | AWS Secret Access Key |
| `aws.s3Bucket` | S3 bucket for document storage |
| `aws.cognito.userPoolId` | Cognito User Pool ID |
| `aws.cognito.standardPassword` | Default password for new Cognito users |

### Role Mapping

| Variable | Description |
|----------|-------------|
| `roleMapping.USER` | External role for 'USER' |

---

## Optional (Production)

### Sage ERP Integration

In `.secrets.json` under `sage.*`:

| Variable | Description |
|----------|-------------|
| `sage.clientId` | Sage OAuth client ID |
| `sage.clientSecret` | Sage OAuth client secret |
| `sage.authUrl` | Sage auth URL |
| `sage.baseUrl` | Sage API base URL |
| `sage.addressPath` | API path for addresses |
| `sage.contactPath` | API path for contacts |

### Svenja Sync Integration

In `.secrets.json` under `svenja.*`:

| Variable | Description |
|----------|-------------|
| `svenja.apiKey` | API key for Svenja |
| `svenja.domain` | Svenja API domain |

### Jobs

| Variable | Description |
|----------|-------------|
| `jobs.run` | Enable scheduled jobs (`true` / `false`) |

---

## Frontend (Vue/Quasar)

| Variable | Description | Default |
|----------|-------------|---------|
| `VUE_ROUTER_MODE` | Router mode: `history` or `hash` | `hash` |
| `VUE_ROUTER_BASE` | Base URL path | - |

---

## Setup

### Development

No additional configuration needed. `.secrets.json` contains all default values.

```bash
npm run start:local
```

### Production

All production variables must be set as environment variables. The setup script creates `.secrets-private.json`:

```bash
node scripts/set-private-secrets.js
npm run start
```
