/*
 * Modules that reach config.ts validate the environment at import time, so
 * tests need values present before anything loads. dotenv does not override
 * variables that are already set, which also keeps a developer's local .env
 * from leaking into test runs.
 */
process.env.JWT_SECRET ||= 'test-jwt-secret'
process.env.STRAVA_CLIENT_ID ||= 'test-client-id'
process.env.STRAVA_CLIENT_SECRET ||= 'test-client-secret'
