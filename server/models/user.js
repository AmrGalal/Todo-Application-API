const mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  email:{
    type:String,
    required: true,
    min: 1,
    trim: true
  }
})

var userModel = mongoose.model('User',userSchema)

module.exports = {userModel}
