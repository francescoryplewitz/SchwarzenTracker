const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2').Strategy
const LOG = new Logger('OAUTH')
const axios = require('../../common/axios')
const prisma = require('../../data/prisma')
const path = require('path')

const persistUser = async (user) => {
  LOG.debug(`Persist User. User data is: ${JSON.stringify(user)}`)
  const doesExists = await prisma.user.findUnique({
    where: {
      externalId: user.externalId
    }
  })
  if (doesExists) {
    await prisma.User.update({
      where: {
        externalId: user.externalId
      },
      data: {
        roles: user.roles
      }
    })
  } else {
    LOG.debug(`Persist User. User with externalId ${user.externalId} does not exist. Abort Login attempt now`)
    return null
  }
  LOG.debug(`Persist User. Upsert User is: ${JSON.stringify(doesExists)}`)
  return doesExists
}

const oauthLogin = async (req, res, user) => {
  const dbUser = await persistUser(user)

  if (!dbUser) {
    return res.sendFile(path.join(__dirname, '../../static', 'no-valid-user.html'))
  }

  const fullUser = Object.assign(user, dbUser)
  req.session.user = fullUser
  req.user = fullUser
  return res.redirect('/#/')
}
const getUserInfo = async (accessToken) => {
  const params = {
    url: `${env.auth.cognitoUrl}/oauth2/userInfo`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
  const result = await axios(params)
  if (!result) {
    return { error: true, message: '' }
  }
  return result
}
const mapUserRoles = (roles) => {
  LOG.debug(`Map roles. Roles are ${JSON.stringify(roles)}`)
  if (!roles) {
    LOG.debug('No roles detected')
    return []
  }
  const roleMapping = roles.map(role => {
    if (role in env.roleMapping) {
      return env.roleMapping[role]
    }
    return null
  }).filter(el => el)
  LOG.debug(`Rolemapping is: ${JSON.stringify(roleMapping)}`)
  return roleMapping
}
const mapUserAttributes = (user) => {
  return {
    firstName: user.given_name,
    lastName: user.name,
    roles: mapUserRoles(user.roles),
    email: user.email,
    externalId: user.username
  }
}

const oAuthCallback = async (accessToken, _refreshToken, _profile, done) => {
  const decodedToken = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
  const result = await getUserInfo(accessToken)
  LOG.debug(`Get User info. User is: ${JSON.stringify(result.data)}`)
  if (result.error) {
    return done(result.message, result.data)
  }
  const user = mapUserAttributes(Object.assign(result.data, { roles: decodedToken['cognito:groups'] }))
  LOG.debug(`oAuth Callback. User after mapping is: ${JSON.stringify(result.data)}`)
  return done(null, user)
}

const registerOAuth = function (app) {
  LOG.info('Register oAuth2 authentication handler')
  passport.use(new OAuth2Strategy({
    authorizationURL: `${env.auth.cognitoUrl}/oauth2/authorize`,
    tokenURL: `${env.auth.cognitoUrl}/oauth2/token`,
    clientID: env.auth.clientId,
    clientSecret: env.auth.clientSecret,
    callbackURL: env.auth.callbackURL
  }, oAuthCallback))
  registerCognito(app)
}

const registerCognito = function (app) {
  app.get('/login', (_req, res) => {
    return res.redirect(`${env.auth.cognitoUrl}/login?client_id=${env.auth.clientId}&response_type=code&scope=openid&redirect_uri=${env.auth.callbackURL}`)
  })
  app.get('/callback', async (req, res, next) => {
    return await passport.authenticate(
      'oauth2',
      (error, user) => {
        if (error) {
          LOG.error(`oaAuth Login failed. Message is: ${error}`)
          return res.redirect('/login')
        }
        return req.login(user, async (loginError) => {
          if (loginError) {
            LOG.error(`oaAuth Login failed. Message is: ${loginError}`)
            return res.redirect('/login')
          }
          return await oauthLogin(req, res, user)
        })
      })(req, res, next)
  })
  app.get('/logout', async (req, res, next) => {
    LOG.info('Log out user: ', req.user?.id)
    LOG.debug(`User to logout: ${JSON.stringify(req.user)}`)

    req.logout(function (err) {
      if (err) {
        LOG.error('Could not logout user', err)
        return next(err)
      }
      LOG.debug('Logout successful')
      res.redirect('/login')
    })
  })

  app.use((req, res, next) => {
    if (skipOAuth(req.originalUrl)) {
      return next()
    }
    req.user = req.session?.user
    LOG.debug(`User object middleware. User is: ${JSON.stringify(req.user)}`)
    if (!req.user) {
      return res.status(401).send(`${env.auth.cognitoUrl}/login?client_id=${env.auth.clientId}&response_type=code&scope=openid&redirect_uri=${env.auth.callbackURL}`)
    }
    next()
  })
}
const skipOAuth = (url) => {
  return false
}
module.exports = {
  registerOAuth
}
