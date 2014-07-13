'use strict';

var debug = require('debug')('api');

var Reol = require('reol');
var Twitter = require('ntwitter');
var nconf = require('nconf');
var async = require('async');
var request = require('request');
var url = require('url');

var articles = new Reol({
  id: true
});


/* Prefetch tweets
============================================================================= */

var twitter = new Twitter({
  consumer_key: nconf.get('consumer_key'),
  consumer_secret: nconf.get('consumer_secret'),
  access_token_key: nconf.get('access_token_key'),
  access_token_secret: nconf.get('access_token_secret')
});

async.waterfall([
  function (next) {
    debug('Fetching tweets');

    twitter.get('/statuses/user_timeline.json', {
      user_id: nconf.get('user_id'),
      count: nconf.get('count') || 100,
      exclude_replies: true
    }, next);
  },
  fetchArticles,
  extractReponse,
  formatArticles,
  saveArticles
], function (err) {
  if(err) {
    return debug('Error fetching articles', err);
  }

  debug('Done fetching initial tweets');
});


/* Listen for new tweets
============================================================================= */

twitter.stream('/statuses/filter', {
  follow: [nconf.get('user_id')]
}, function (stream) {
  stream.on('data', function (data) {
    debug('data!', data);

    async.waterfall([
      fetchArticles.bind(null, [data]),
      extractReponse,
      formatArticles,
      saveArticles
    ], function (err) {
      if(err) {
        return debug('Error saving streamed tweet');
      }

      debug('New tweet saved');
    });
  });

  stream.on('error', debug.bind(null, 'Tweet stream error'));
});


/* Public API
============================================================================= */

exports.short = {
  get: function (options, callback) {
    var result = articles.slice(options.offset || 0, options.count || 20);

    result = result.map(function (article) {
      return {
        id: article.id,
        title: article.title
      };
    });

    callback(null, result);
  }
};

exports.full = {
  getById: function (id, callback) {
    callback(null, articles.findOne({
      id: id
    }));
  }
};


/* Private helpers
============================================================================= */

function fetchArticles (tweets, callback) {
  debug('Fetching articles');

  async.mapLimit(tweets, nconf.get('request_limit') || 5, function (tweet, next) {
    var linkUrl, apiUrl, articleId;

    try {
      // Throws if the tweet doesn't contain a url
      linkUrl = tweet.entities.urls[0].expanded_url;
    }
    catch (e) {
      debug('Error: no url found in tweet', tweet.text);
      return next();
    }

    articleId = url.parse(linkUrl).path.split('/').slice(-1).join('');
    apiUrl = nconf.get('api_url') + '/articles/' + articleId;

    request(apiUrl, next);
  }, callback);
}

function extractReponse (responses, callback) {
  callback(null, responses.filter(Boolean).map(function (response) {
    return JSON.parse(response.body);
  }));
}

function formatArticles (articles, callback) {
  callback(null, articles.map(function (article) {
    return {
      id: article.id,
      title: article.title,
      resources: article.resources
    };
  }));
}

function saveArticles (items, callback) {
  articles.push.apply(articles, items);
  callback();
}
