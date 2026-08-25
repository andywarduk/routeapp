import dotenv from 'dotenv'
import type { SignOptions } from 'jsonwebtoken'

dotenv.config({ quiet: true })

const required = (name: string): string => {
  const value = process.env[name]

  if (!value || value === '') {
    throw new Error(`Required environment variable ${name} is not set`)
  }

  return value
}

const optional = (name: string): string | undefined => {
  const value = process.env[name]
  return !value || value === '' ? undefined : value
}

const nodeEnv = process.env.NODE_ENV || 'development'

export const isProduction = nodeEnv === 'production'

/*
 * Read and validate configuration once, at startup. Previously these were read
 * inline with `|| ''` fallbacks, which turned a missing JWT_SECRET into an
 * empty signing key rather than an error.
 */
export const config = {
  nodeEnv,
  port: parseInt(process.env.PORT || '6200', 10),

  jwtSecret: required('JWT_SECRET'),
  jwtIssuer: process.env.JWT_ISSUER || 'corsham.cc',
  // Tokens carry no expiry unless one is set here. Anything jsonwebtoken
  // accepts works ('7d', '12h', or seconds as a number).
  // jsonwebtoken types this as a ms-style template literal; an env var is a
  // plain string, and jsonwebtoken validates the format itself at sign time.
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  jwtAlgorithm: 'HS256' as const,

  stravaClientId: required('STRAVA_CLIENT_ID'),
  stravaClientSecret: required('STRAVA_CLIENT_SECRET'),

  // Athlete granted admin on first login. Optional.
  superAthlete: optional('SUPER_ATHLETE')
    ? parseInt(required('SUPER_ATHLETE'), 10)
    : undefined,

  /*
   * Both compose stacks serve the API from the same origin as the app (nginx
   * proxies /api in production, the vite dev server proxies it in
   * development), so cross-origin requests are not needed and CORS stays off
   * unless an origin is named explicitly.
   */
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o !== ''),

  db: {
    host: process.env.MONGO_HOST || (isProduction ? 'mongodb-prod' : 'mongodb-dev'),
    name: process.env.MONGO_DB || 'routes',
    user: optional('MONGO_INITDB_ROOT_USERNAME'),
    password: optional('MONGO_INITDB_ROOT_PASSWORD')
  }
}

export const mongoUri = () => {
  const { host, name, user, password } = config.db

  let userPwd = ''

  if (user) {
    userPwd = password
      ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}@`
      : `${encodeURIComponent(user)}@`
  }

  return `mongodb://${userPwd}${host}/${name}?authSource=admin`
}
