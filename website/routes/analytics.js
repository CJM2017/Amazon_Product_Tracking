var express = require('express');
var router = express.Router();

// GET home page ejs file called index
router.get('/', function(req, res, next) {
  res.render('analytics.ejs', { title: 'Amazon Product Tracker' });
});

module.exports = router;
