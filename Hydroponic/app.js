var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var passport = require('passport');
var models = require('./models');

//-----router-----
var routes = require('./routes/index');
var user = require('./routes/user');
var device = require('./routes/device');
var crop = require('./routes/crop');
var threshold = require('./routes/threshold');
var data = require('./routes/data');
var schedule = require('./routes/schedule');
var article = require('./routes/article');
var comment = require('./routes/comment');
//----------------

var cors = require('cors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use('/', routes);
app.use('/user', user.router);
app.use('/device', device.router);
app.use('/crop', crop.router);
app.use('/threshold', threshold.router);
app.use('/data', data.router);
app.use('/schedule', schedule.router);
app.use('/article', article.router);
app.use('/comment', comment.router);
// Passport init
app.use(passport.initialize());
app.use(passport.session());

app.get('/*', function (req, res) {
  res.render('index');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// models.sequelize.sync({force: true});
models.sequelize.sync();

module.exports = app;
