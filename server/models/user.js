const mongoose = require('mongoose');
const validator = require('validator');
const lodash = require('lodash');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

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
  var token = jwt.sign({_id:user._id.toHexString(),access},process.env.JWT_KEY).toString()
  user.tokens = user.tokens.concat({access,token})
  return user.save().then(()=>{return token})
}
userSchema.methods.removeToken = function(token){
  var user = this;
  return user.updateOne({
    $pull:{
      tokens:{
        token
      }
    }
  })
}
userSchema.statics.findByToken = function(token){
  var model = this;
  var decoded;
  try{
    decoded = jwt.verify(token,process.env.JWT_KEY)
  } catch(e){
    return Promise.reject();
  }
  return model.findOne({
    '_id':decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token
  })
}
userSchema.statics.findByCredentials = function(email,password){
  var model = this;
  return model.findOne({email})
  .then((user)=>{
    if(!user) throw "User not found"
    return bcrypt.compare(password,user.password)
    .then((res)=>{
      if(!res) throw "Non matching passwords"
      return Promise.resolve(user);
    })
  })
}
userSchema.pre('save',function(next){
  var user = this;
  if(user.isModified('password')){ // to avoid changing the password when we didn't change it
    bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(this.password,salt,(err,hash)=>{
        user.password = hash;
        next();
      })
    })
  }else next();
})
var userModel = mongoose.model('User',userSchema)

module.exports = {userModel}
