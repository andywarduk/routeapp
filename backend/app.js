// Libraries
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')

const setupJwtAuth = require('./src/auth/jwtAuth')

main()

async function main()
{
  // Load env
  dotenv.config()

  // Server configuration
  const basePath = '/api'
  const port = 6200

  // Connect to DB
  let connected = false
  let connTry = 0

  let dbHost

  // Set up mongoose
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);

  if (process.env.NODE_ENV != 'production') {
    dbHost = 'mongodb-dev'
  } else {
    dbHost = 'mongodb-prod'
  }

  // Build user name + password string
  let dbUserPwd = ''

  if (process.env.MONGO_INITDB_ROOT_USERNAME && process.env.MONGO_INITDB_ROOT_USERNAME !== '') {
    if (process.env.MONGO_INITDB_ROOT_PASSWORD && process.env.MONGO_INITDB_ROOT_PASSWORD !== '') {
      dbUserPwd = `${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@`
    } else {
      dbUserPwd = `${process.env.MONGO_INITDB_ROOT_USERNAME}@`
    }
  }

  while(!connected && ++connTry <= 20) {
    try{
      await mongoose.connect(`mongodb://${dbUserPwd}${dbHost}/routes?authSource=admin`)
      connected = true
    } catch(err) {
      console.error("Failed to connect to database", err)
      await delay(5000)
    }
  }

  if (!connected) throw new Error('Failed to connect to the database')

  // Set up jwt auth
  setupJwtAuth()

  // Routes and backend functions
  const routesRoutes = require('./src/routes/routesRoutes')
  const authRoutes = require('./src/auth/authRoutes')
  const stravaRoutes = require('./src/strava/stravaRoutes')
  const usersRoutes = require('./src/users/usersRoutes')

  // App Instance
  const app = express()
  app.use(express.static('public'))
  app.use(cors())
  app.use(bodyParser.json({
    limit: '4096kb'
  }))

  app.use(basePath, routesRoutes)
  app.use(basePath, authRoutes)
  app.use(basePath, stravaRoutes)
  app.use(basePath, usersRoutes)

  // Execute App
  app.listen(port, () => {
    console.log(`Routes backend running on port ${port} (${process.env.NODE_ENV})`)
  })
}

function delay(ms){
  let ctr
  let rej

  const p = new Promise(function (resolve, reject) {
      ctr = setTimeout(resolve, ms);
      rej = reject;
  })

  p.cancel = function() {
    clearTimeout(ctr)
    rej(Error("Cancelled"))
  }

  return p
}