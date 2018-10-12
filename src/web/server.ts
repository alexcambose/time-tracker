const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();
app.set('views', path.resolve(__dirname, '../../web'));

var hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.resolve(__dirname, '../../web/layouts'),
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

export default app;
