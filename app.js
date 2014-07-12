'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var nconf = require('nconf');
var app = express();

app.use(logger('dev'));

nconf.env().file({ file: './config.json' });


/* Routes
============================================================================= */

app.use('/articles', require('./routes/articles'));


/* Error handling
============================================================================= */

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});


module.exports = app;
