import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

import { config, mongoUri } from './src/config'
import setupJwtAuth from './src/auth/jwtAuth'

  // Routes and backend functions
import routesRoutes from './src/routes/routesRoutes'
import authRoutes from './src/auth/authRoutes'
import stravaRoutes from './src/strava/stravaRoutes'
import usersRoutes from './src/users/usersRoutes'

const basePath = '/api'
const connectRetries = 20
const connectRetryDelay = 5000
const pingTimeout = 2000
const maxPoolSize = 10

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

async function main()
{
  // Connect to DB. Mongoose 6+ dropped useNewUrlParser / useUnifiedTopology /
  // useCreateIndex / useFindAndModify - the old behaviour is now the only one.
  await connectToDatabase()

  // Set up jwt auth
  setupJwtAuth()

  // App Instance
  const app = express()
  app.use(express.static('public'))

  // Only enable CORS when an origin is configured. Previously cors() ran with
  // no options, which allowed any origin.
  if (config.corsOrigins.length > 0) {
    app.use(cors({
      origin: config.corsOrigins
    }))
  }

  app.use(express.json({
    limit: '4096kb'
  }))

  // Health check, for container orchestration
  app.get(`${basePath}/health`, async (_req, res) => {
    const ready = await databaseReady()

    res.status(ready ? 200 : 503).json({
      ok: ready,
      db: ready ? 'connected' : 'disconnected'
    })
  })

  app.use(basePath, routesRoutes)
  app.use(basePath, authRoutes)
  app.use(basePath, stravaRoutes)
  app.use(basePath, usersRoutes)

  // Execute App
  app.listen(config.port, () => {
    console.log(`Routes backend running on port ${config.port} (${config.nodeEnv})`)
  })
}

/*
 * readyState is only the driver's view of the socket, so it is followed by a
 * real round trip: a mongod which has wedged while holding the connection open
 * still reads as connected otherwise.
 *
 * The round trip needs a client side bound. maxTimeMS asks the server to give
 * up after the deadline, which is no use when the server is the thing that has
 * stopped answering - it never reads the command in the first place, and the
 * ping then hangs for as long as the caller will wait. The race is what
 * actually fires in that case; maxTimeMS is kept for the opposite one, where
 * the server is alive but slow.
 */
async function databaseReady()
{
  if (mongoose.connection.readyState !== 1) return false

  const db = mongoose.connection.db

  if (!db) return false

  let timer: ReturnType<typeof setTimeout> | undefined

  const expired = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => resolve(false), pingTimeout)
  })

  try {
    return await Promise.race([
      db.admin().ping({ maxTimeMS: pingTimeout }).then(() => true),
      expired
    ])
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function connectToDatabase()
{
  const uri = mongoUri()

  for (let attempt = 1; attempt <= connectRetries; attempt++) {
    try {
      await mongoose.connect(uri, { maxPoolSize })
      return
    } catch (err) {
      console.error(`Failed to connect to database (attempt ${attempt}/${connectRetries})`, err)

      if (attempt < connectRetries) await delay(connectRetryDelay)
    }
  }

  throw new Error('Failed to connect to the database')
}

function delay(ms: number)
{
  return new Promise((resolve) => setTimeout(resolve, ms))
}
