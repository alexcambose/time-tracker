const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
var pjson = require('../../package.json');

const app = express();
app.set('views', path.resolve(__dirname, '../../web'));

var hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.resolve(__dirname, '../../web/layouts'),
  helpers: {
    foo: function() {
      return 'FOO!';
    },
    bar: function() {
      return 'BAR!';
    },
  },
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.get('/', (req, res) => {
  res.render('home', {
    version: pjson.version,
  });
});

export default app;
