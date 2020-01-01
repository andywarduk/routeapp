var express = require('express')
var app = express()
var router = express.Router()

// Schema
var Routes = require('../models/routes')

// Get specific route
router.route('/:id').get(async function (req, res) {
  try {
    var id = req.params.id;

    var doc = await Routes.findOne({
      routeid: id
    })

    res.json(doc)

  } catch (err) {
    res.status(400).json(err)

  }
});

// Get all routes
router.route('/').get(async function (req, res) {
  try {
    var routes = await Routes.find()

    res.json(routes)

  } catch(err) {
    res.status(400).json(err)

  }
});

// Add route
router.route('/add/:id').post(async function (req, res) {
  var id = req.params.id

  var doc = {
    ...req.body,
    routeid: id
  }

  var item = new Routes(doc);

  try {
    var saved = await item.save()

    res.json(`Saved route ${id}`)

  } catch (err) {
    res.status(400).json(err)

  }
});

// Delete route
router.route('/delete/:id').delete(async function (req, res) {
  var id = req.params.id

  try {
    await Routes.findOneAndRemove({
      routeid: id
    })

    res.json(`Deleted route ${id}`)

  } catch (err) {
    res.status(400).json(err)

  }

})

module.exports = router
