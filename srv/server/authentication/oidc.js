const LOG = new Logger('OIDC')
const crypto = require('crypto')
const prisma = require('../../data/prisma')

let oidcConfig
let oidc

const initOidc = async () => {
  oidc = await import('openid-client')
  console.log('Hier------------------------------------------')
  console.log(env.auth.idpUrl)
  console.log('Hier------------------------------------------')
  const idpUrl = new URL(env.auth.idpUrl)
  LOG.info('Discovering OIDC provider at ' + env.auth.idpUrl)

  const options = idpUrl.protocol === 'http:'
    ? { execute: [oidc.allowInsecureRequests] }
    : undefined

  oidcConfig = await oidc.discovery(
    idpUrl,
    env.auth.clientId,
    env.auth.clientSecret,
    oidc.ClientSecretBasic(env.auth.clientSecret),
    options
  )
  LOG.info('OIDC discovery complete')
}

const upsertUser = async (claims) => {
  const role = claims.role
  const roles = role ? [role] : ['user']

  return await prisma.user.upsert({
    where: { externalId: claims.sub },
    update: {
      firstName: claims.given_name || null,
      lastName: claims.family_name || null,
      email: claims.email || null,
      roles
    },
    create: {
      externalId: claims.sub,
      firstName: claims.given_name || null,
      lastName: claims.family_name || null,
      email: claims.email || null,
      roles
    }
  })
}

const isPublicPath = (url) => {
  const publicPaths = ['/login', '/callback', '/logout', '/device', '/version', '/health', '/csrf-token']
  return publicPaths.some(p => url.startsWith(p))
}

const isStaticAsset = (url) => {
  return url.startsWith('/assets') ||
    url.startsWith('/css') ||
    url.startsWith('/js') ||
    url.startsWith('/fonts') ||
    url.startsWith('/icons') ||
    url === '/' ||
    url === '/index.html' ||
    url === '/favicon.ico'
}

const registerOidc = (app) => {
  LOG.info('Register OIDC authentication handler')

  app.get('/login', async (req, res) => {
    try {
      const codeVerifier = oidc.randomPKCECodeVerifier()
      const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier)
      const state = crypto.randomBytes(32).toString('hex')
      req.session.pkceCodeVerifier = codeVerifier
      req.session.oauthState = state

      const redirectTo = oidc.buildAuthorizationUrl(oidcConfig, {
        redirect_uri: env.auth.callbackUrl,
        scope: 'openid profile email',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state
      })

      LOG.info(`Redirecting to IDP: ${redirectTo.href}`)
      LOG.info(`Login session ID: ${req.session.id}`)
      LOG.info(`Login session has pkce: ${!!req.session.pkceCodeVerifier}`)
      res.redirect(redirectTo.href)
    } catch (error) {
      LOG.error(`OIDC login redirect failed: ${error.message}`)
      res.status(500).json({ error: 'Login failed' })
    }
  })

  app.get('/callback', async (req, res) => {
    LOG.info(`Callback session ID: ${req.session.id}`)
    LOG.info(`Callback session keys: ${Object.keys(req.session).join(', ')}`)
    const currentUrl = new URL(req.protocol + '://' + req.get('host') + req.originalUrl)
    const codeVerifier = req.session.pkceCodeVerifier
    const expectedState = req.session.oauthState
    delete req.session.pkceCodeVerifier
    delete req.session.oauthState

    try {
      const tokens = await oidc.authorizationCodeGrant(oidcConfig, currentUrl, {
        pkceCodeVerifier: codeVerifier,
        expectedState
      })

      const claims = tokens.claims()
      LOG.info(`OIDC login for sub: ${claims.sub}`)

      const dbUser = await upsertUser(claims)
      req.session.user = {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        externalId: dbUser.externalId,
        roles: dbUser.roles
      }

      res.redirect('/#/')
    } catch (error) {
      LOG.error(`OIDC callback failed: ${error.message}`)
      LOG.error(`OIDC error code: ${error.code}`)
      LOG.error(`OIDC error cause: ${error.cause?.message || error.cause}`)
      LOG.error(`OIDC currentUrl: ${currentUrl.href}`)
      LOG.error(`OIDC codeVerifier present: ${!!codeVerifier}`)
      LOG.error(`OIDC expectedState present: ${!!expectedState}`)
      if (error.response) {
        LOG.error(`OIDC response status: ${error.response.status}`)
        LOG.error(`OIDC response body: ${JSON.stringify(error.response.body)}`)
      }
      res.redirect('/#/login')
    }
  })

  app.get('/logout', (req, res) => {
    LOG.info('Logout user: ' + req.session?.user?.id)
    req.session.destroy(() => {
      res.redirect('/#/login')
    })
  })

  app.use((req, res, next) => {
    if (isPublicPath(req.originalUrl) || isStaticAsset(req.originalUrl)) return next()

    req.user = req.session?.user
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
    next()
  })
}

module.exports = { initOidc, registerOidc }
