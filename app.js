const express = require('express');
const cors = require('cors');
const db = require('./models/db');
const authMw = require('./lib/auth-mw');
const log = require('./lib/logger');
const bodyParser = require('body-parser');
const { CustomError } = require('./lib/error-util');
const users = require('./routes/user.route');
const httpStatus = require('./lib/http-status');

const app = express();
require('./lib/app-locals')(app);// set local variables for the app

// Temporary static file server
if (app.get('env') === 'development') {
  app.use(express.static('public'));
}

db.connect(app.get('env'));

app.use(cors());

app.use(bodyParser.json());

app.use(authMw);

app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new CustomError(404, 'Not Found');
  next(err);
});

// error logger
app.use((err, req, res, next) => {
  if (app.get('env') === 'development' || app.get('env') === 'test') log.e(err);
  else if (!([400, 401, 404].indexOf(err.status) > -1)) log.e(err);
  next(err);
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(err.status || 500);
  return res.json({ Error: httpStatus.getStatusText(err.status || 500) });
});

module.exports = app;
