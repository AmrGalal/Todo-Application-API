// This file is for the configuration of the NoSQL mongodb database
//
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //use the built in promise system
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});

module.exports = {
  mongoose
}
