const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config/config');
const {mongoose} = require('./db/mongooseConfig');

var app = express();
app.use(bodyParser.json())
app.use(require('./routes/userroutes'))
app.use(require('./routes/todoroutes'))
app.listen(process.env.PORT, console.log('Ready'));


module.exports = {
  app
}
