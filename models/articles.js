'use strict';

var Reol = require('reol');
var Twitter = require('ntwitter');
var nconf = require('nconf');

var articles = new Reol({
  id: true
});


/* Pre-fetch tweets
============================================================================= */

var twitter = new Twitter({
  consumer_key: nconf.get('consumer_key'),
  consumer_secret: nconf.get('consumer_secret'),
  access_token_key: nconf.get('access_token_key'),
  access_token_secret: nconf.get('access_token_secret')
});

twitter.get('/statuses/user_timeline.json', {
  screen_name: nconf.get('screen_name'),
  count: nconf.get('count') || 100
}, function (err, result) {
  //## Temp
  articles = result;
});


/* Listen for new tweets
============================================================================= */
// stream.on('tweet', fetchArticle(.., formatArticles(.., saveArticles())))


/* Public API
============================================================================= */

exports.short = {
  get: function (options, callback) {
    var result = articles.slice(options.offset || 0, options.count || 20);

    /*result = result.map(function (article) {
      return {
        title: article.title,
        excerpt: article.excerpt
      };
    });*/

    callback(null, result);
  }
};

exports.full = {
  getById: function (id, callback) {
    callback(articles.find({
      id: id
    }));
  }
};
