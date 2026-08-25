import dotenv from 'dotenv'

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
const config = {
  nodeEnv,
  port: parseInt(process.env.PORT || '6200', 10),

  jwtSecret: required('JWT_SECRET'),
  jwtIssuer: process.env.JWT_ISSUER || 'corsham.cc',

  stravaClientId: required('STRAVA_CLIENT_ID'),
  stravaClientSecret: required('STRAVA_CLIENT_SECRET'),

  // Athlete granted admin on first login. Optional.
  superAthlete: optional('SUPER_ATHLETE')
    ? parseInt(required('SUPER_ATHLETE'), 10)
    : undefined,

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

export default config
