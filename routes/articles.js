'use strict';

var express = require('express');
var router = express.Router();
var articles = require('../models/articles');

router.get('/', function(req, res, next) {
  articles.short.get({
    count: req.query.count,
    offset: req.query.offset
  }, function (err, articles) {
    if(err) {
      return next(err);
    }

    res.json(articles);
  });
});

module.exports = router;
