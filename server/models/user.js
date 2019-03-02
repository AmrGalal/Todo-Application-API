const mongoose = require('mongoose');
const validator = require('validator');
const lodash = require('lodash');
const jwt = require('jsonwebtoken')

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
userSchema.methods.toJSON = function(){
  return lodash.pick(this.toObject(),['_id','email'])
}
userSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = 'auth'
  var token = jwt.sign({_id:user._id.toHexString(),access},'abc123').toString()
  user.tokens = user.tokens.concat({access,token})
  return user.save().then(()=>{return token})
}

userSchema.statics.findByToken = function(token){
  var model = this;
  var decoded;
  try{
    decoded = jwt.verify(token,'abc123')
  } catch(e){
    return Promise.reject();
  }
  return model.findOne({
    '_id':decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token
  })
}
var userModel = mongoose.model('User',userSchema)

module.exports = {userModel}
