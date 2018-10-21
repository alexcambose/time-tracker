const express = require('express');
const path = require('path');
import * as enums from '../enums';
const app = express();
app.set('views', path.resolve(__dirname, '../../web'));

app.set('view engine', 'ejs');

app.use(function(req, res, next) {
  res.locals = {
    enums,
  };
  next();
});
export default app;
