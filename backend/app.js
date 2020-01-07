// Libraries
var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var cors = require('cors')

main()

async function main()
{
  // Server configuration
  var basePath = '/routes'
  var port = 6200

  // Connect to DB
  var connected = false
  var connTry = 0

  var dbHost

  if (process.env.NODE_ENV != 'production') {
    dbHost = 'mongodb-dev'
  } else {
    dbHost = 'mongodb-prod'
  }

  while(!connected && ++connTry <= 20) {
    try{
      await mongoose.connect(`mongodb://${dbHost}/Routes`)
      connected = true
    } catch(err) {
      console.error("Failed to connect to database", err)
      await delay(5000)
    }
  }

  if (!connected) {
    process.exit(1)
  }

  // Routes and backend functions
  var routesRoutes = require('./src/routes/routesRoutes')

  // App Instance
  var app = express()
  app.use(express.static('public'))
  app.use(cors())
  app.use(bodyParser.json({
    limit: '4096kb'
  }))
  app.use(basePath, routesRoutes)

  // Execute App
  app.listen(port, () => {
    console.log(`Routes backend running on port ${port} (${process.env.NODE_ENV})`)
  })
}

function delay(ms){
  var ctr
  var rej

  var p = new Promise(function (resolve, reject) {
      ctr = setTimeout(resolve, ms);
      rej = reject;
  })

  p.cancel = function() {
    clearTimeout(ctr)
    rej(Error("Cancelled"))
  }

  return p
}
