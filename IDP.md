# Guide: IDP in Node.js nutzen

Dieser Guide erklaert, wie eine Node.js App den IDP nutzt (Login via OIDC, Rollen auslesen, User-Rollen verwalten).

## 1) Basis-URLs und Discovery

- IDP-Base-URL: `https://login.schwarzentracker.com` (in deiner Umgebung ggf. anders)
- OIDC Discovery: `/.well-known/openid-configuration`
- OAuth2/OIDC Endpoints kommen aus Discovery (auth, token, jwks, etc.)
- App-API (Client Credentials): `/api/app/*`
- Admin-API (nur Master-Admin Session): `/api/admin/*`

## 2) App im IDP anlegen

Erstelle einen Client im Admin Center:

- `Client ID` (z.B. `myapp`)
- `Redirect URI` deiner Node.js App (z.B. `https://app.example.com/callback`)
- `Verfuegbare Rollen` (z.B. `admin,user`)
- Optional: `Client Credentials` aktivieren (wenn App selbst Rollen verwalten soll)

Notiere dir das Client Secret (wird nur einmal angezeigt).

## 3) Login in Node.js (OIDC Authorization Code + PKCE)

Empfehlung: OIDC Library nutzen (z.B. `openid-client`) und Discovery verwenden.

Grob-Ablauf:

1. Discovery von `/.well-known/openid-configuration`
2. Authorization Code Flow mit PKCE starten
3. Code gegen Token tauschen
4. ID Token verifizieren (JWKS)
5. Rollen im ID Token nutzen

Die App-spezifische Rolle wird im Token als `role` geliefert:

```js
// Beispiel: Role aus ID Token
const role = idToken.role // "admin" | "editor" | "viewer" | undefined
if (role === 'admin') {
  // Admin-Features freischalten
}
```

## 4) Rollen und User-Management fuer die eigene App

Wenn deine App User-Rollen selbst verwalten soll, aktiviere Client Credentials beim Client.

### 4.1 Access Token holen (Client Credentials)

```
POST /oauth2/token
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=app:roles:manage
```

### 4.2 App-API Endpoints (Bearer Token)

- `GET /api/app/roles` -> eigene Rollenliste
- `PUT /api/app/roles` -> eigene Rollenliste setzen
- `GET /api/app/users` -> User + Rolle fuer diese App
- `PUT /api/app/users/:id/role` -> Rolle setzen
- `DELETE /api/app/users/:id/role` -> Rolle entfernen

Beispiel (Node.js Fetch):

```js
const res = await fetch(`${IDP_URL}/api/app/users`, {
  headers: { Authorization: `Bearer ${token}` }
})
const { users } = await res.json()
```

## 5) Master-Admin Aufgaben

Master-Admin ist ein Kratos-User mit `metadata_public.is_admin = true`.

Master-Admin API (nur mit Admin-Session Cookie):

- `GET /api/admin/identities`
- `PATCH /api/admin/identities/:id/roles`
- `GET /api/admin/clients`
- `POST /api/admin/clients`
- ...

Hinweis: Diese Endpoints sind fuer Admin Center / Browser gedacht. Fuer App-spezifische Rollen nutze die App-API mit Client Credentials (siehe oben).

## 6) Wichtige Datenmodelle

- Rollen pro App werden in `metadata_public.app_roles` gespeichert
- Master-Admin Flag: `metadata_public.is_admin = true`
- `role` Claim im ID Token entspricht der Rolle der App (falls gesetzt)

## 7) Lokales Setup / Docker

- Kratos Admin API laeuft intern auf `http://kratos:4434` (Docker Netzwerk)
- Vom Host ist der Admin-Port normalerweise nicht gemappt
- App-API und OIDC laufen ueber die Caddy-Front (z.B. Port 4080)

## 8) Troubleshooting

- Kein `role` im Token: User hat keine Rolle fuer diese App
- 401 bei `/api/app/*`: Access Token fehlt oder Scope `app:roles:manage` fehlt
- Admin-API nicht erreichbar vom Host: im Docker-Netz oder im Container ausfuehren

curl -sS -X POST 'https://api.hosting.ionos.com/dns/v1/dyndns' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "X-API-Key: $keypair" \
  --data '{"domains":["login.schwarzentracker.com"],"description":"pi-ddns"}'



Kd5t.OorAq0w.Pqs2AkV2qSjxy
                                                                                                                                                                                                       

