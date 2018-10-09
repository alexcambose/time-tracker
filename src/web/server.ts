const express = require('express');
const exphbs = require('express-handlebars');
var path = require('path');
const app = express();
app.use(express.static(path.join(__dirname + './public')));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  res.render('home');
});

export default app;
