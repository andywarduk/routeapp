import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

import config, { mongoUri } from './src/config'
import setupJwtAuth from './src/auth/jwtAuth'

  // Routes and backend functions
import routesRoutes from './src/routes/routesRoutes'
import authRoutes from './src/auth/authRoutes'
import stravaRoutes from './src/strava/stravaRoutes'
import usersRoutes from './src/users/usersRoutes'

const basePath = '/api'
const connectRetries = 20
const connectRetryDelay = 5000

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
  app.use(cors())
  app.use(express.json({
    limit: '4096kb'
  }))

  app.use(basePath, routesRoutes)
  app.use(basePath, authRoutes)
  app.use(basePath, stravaRoutes)
  app.use(basePath, usersRoutes)

  // Execute App
  app.listen(config.port, () => {
    console.log(`Routes backend running on port ${config.port} (${config.nodeEnv})`)
  })
}

async function connectToDatabase()
{
  const uri = mongoUri()

  for (let attempt = 1; attempt <= connectRetries; attempt++) {
    try {
      await mongoose.connect(uri)
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
