import { describe, it, expect, beforeEach, vi } from 'vitest'

// Stub dotenv so these tests read only the env they set up. Without this they
// pick up the developer's real backend/.env.
vi.mock('dotenv', () => ({
  default: { config: () => ({ parsed: {} }) }
}))

/*
 * config.ts reads and validates the environment at import time, so each case
 * has to reset the module registry and import it fresh.
 */
const loadConfig = async (env: Record<string, string | undefined>) => {
  vi.resetModules()

  for (const key of ['JWT_SECRET', 'JWT_ISSUER', 'JWT_EXPIRES_IN', 'STRAVA_CLIENT_ID',
    'STRAVA_CLIENT_SECRET', 'SUPER_ATHLETE', 'CORS_ORIGIN', 'MONGO_HOST', 'MONGO_DB',
    'MONGO_INITDB_ROOT_USERNAME', 'MONGO_INITDB_ROOT_PASSWORD', 'NODE_ENV', 'PORT']) {
    delete process.env[key]
  }

  Object.assign(process.env, env)

  return import('./config')
}

const valid = {
  JWT_SECRET: 'secret',
  STRAVA_CLIENT_ID: '123',
  STRAVA_CLIENT_SECRET: 'shhh'
}

describe('config', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('rejects a missing JWT_SECRET rather than signing with an empty key', async () => {
    await expect(loadConfig({ STRAVA_CLIENT_ID: '1', STRAVA_CLIENT_SECRET: '2' }))
      .rejects.toThrow(/JWT_SECRET/)
  })

  it('rejects an empty JWT_SECRET', async () => {
    await expect(loadConfig({ ...valid, JWT_SECRET: '' }))
      .rejects.toThrow(/JWT_SECRET/)
  })

  it('rejects missing strava credentials', async () => {
    await expect(loadConfig({ JWT_SECRET: 'x', STRAVA_CLIENT_ID: '1' }))
      .rejects.toThrow(/STRAVA_CLIENT_SECRET/)
  })

  it('defaults tokens to a 7 day expiry', async () => {
    const { default: config } = await loadConfig(valid)
    expect(config.jwtExpiresIn).toBe('7d')
  })

  it('leaves CORS disabled unless origins are named', async () => {
    const { default: config } = await loadConfig(valid)
    expect(config.corsOrigins).toEqual([])
  })

  it('parses a comma separated CORS_ORIGIN, ignoring blanks and spacing', async () => {
    const { default: config } = await loadConfig({
      ...valid,
      CORS_ORIGIN: 'https://a.example, https://b.example, '
    })
    expect(config.corsOrigins).toEqual(['https://a.example', 'https://b.example'])
  })

  it('treats an unset SUPER_ATHLETE as absent rather than NaN', async () => {
    const { default: config } = await loadConfig(valid)
    expect(config.superAthlete).toBeUndefined()
  })
})

describe('mongoUri', () => {
  it('omits credentials when none are set', async () => {
    const { mongoUri } = await loadConfig({ ...valid, MONGO_HOST: 'db' })
    expect(mongoUri()).toBe('mongodb://db/routes?authSource=admin')
  })

  it('includes user and password when both are set', async () => {
    const { mongoUri } = await loadConfig({
      ...valid, MONGO_HOST: 'db',
      MONGO_INITDB_ROOT_USERNAME: 'root', MONGO_INITDB_ROOT_PASSWORD: 'pw'
    })
    expect(mongoUri()).toBe('mongodb://root:pw@db/routes?authSource=admin')
  })

  it('percent-encodes credentials so a password with @ or : cannot corrupt the URI', async () => {
    const { mongoUri } = await loadConfig({
      ...valid, MONGO_HOST: 'db',
      MONGO_INITDB_ROOT_USERNAME: 'ro@ot', MONGO_INITDB_ROOT_PASSWORD: 'p:w@rd'
    })
    expect(mongoUri()).toBe('mongodb://ro%40ot:p%3Aw%40rd@db/routes?authSource=admin')
  })

  it('selects the production db host from NODE_ENV', async () => {
    const { mongoUri } = await loadConfig({ ...valid, NODE_ENV: 'production' })
    expect(mongoUri()).toContain('mongodb-prod')
  })
})
