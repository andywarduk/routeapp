// Libraries
var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var cors = require('cors')

// Server configuration
var basePath = '/routes'
var port = 6200

// Connection to DB
mongoose.connect('mongodb://mongodb/Routes')
    .then(() => {
      console.log('Backend Started')
    })
    .catch(err => {
        console.error('Backend error:', err.stack)
        process.exit(1)
    });

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
  console.log('Routes backend running on Port: ', port)
})
