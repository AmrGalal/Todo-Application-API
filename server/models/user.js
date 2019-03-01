const mongoose = require('mongoose');
const validator = require('validator');
var userSchema = new mongoose.Schema({
  email:{
    type:String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate:{
      validator: validator.isEmail, // we assigned the validation function we want to use to a built in one
      message: '{VALUE} is not a valid email'
    }
  },
  password:{
    type: String,
    required: true,
    minlength: 6
  },
  tokens:[{
    access:{
      type:String,
      required: true
    },token:{
      type:String,
      required: true
    }
  }]
})

var userModel = mongoose.model('User',userSchema)

module.exports = {userModel}
