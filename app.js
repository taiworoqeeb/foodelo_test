'use strict';
const express = require('express');
const app = express();
const Session = require('cookie-session');
const passport = require('passport');
const router = require('./routes/routes');
const cors = require("cors");
const bodyParser = require('body-parser');
require('dotenv').config();
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

app.use(cookieParser(process.env.CSECRET))
app.use(Session({
  secret: process.env.CSECRET,
  maxAge: 10 * 60 * 1000,
  httpOnly: true,
  sameSite: 'none',
  path: '/',
  secure: (process.env.NODE_ENV !== 'development')
  },
));
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['POST', 'GET', 'OPTIONS', 'HEAD', 'DELETE', 'PUT', 'PATCH'],
  exposedHeaders: ["*","set-cookie", "Authorization"]
}));
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json())
app.use(passport.initialize());
app.use(passport.session());
require('./middleware/passport')(passport);
app.use('/', router);



module.exports = app;