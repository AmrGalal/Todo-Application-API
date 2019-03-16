const express = require('express');
const lodash = require('lodash');
const bcrypt = require('bcryptjs');

const {userModel} = require('../models/user')
const {authenticate} = require('../middleware/authenticate')
var router = express.Router()

//Sign up route
router.post('/users',(req,res)=>{
  var body = lodash.pick(req.body,['email','password'])
  var user = new userModel(body)
  user.save()
  .then((result)=>{
    return result.generateAuthToken();
  })
  .then((token)=>{
    res.header('x-auth',token).status(200).send(user)
  })
  .catch((e)=>res.status(400).send(e))
})

router.post('/users/login',(req,res)=>{
  var body = lodash.pick(req.body,['email','password'])
  userModel.findByCredentials(body.email,body.password)
  .then((user)=>{
    return user.generateAuthToken();
  })
 .then((token)=>{
   res.header('x-auth',token).status(200).send()
  })
  .catch((e)=>res.status(400).send(e))
})

router.get('/users/me',authenticate,(req,res)=>{
  res.send(req.user)
})
router.delete('/users/me/token',authenticate,(req,res)=>{
  req.user.removeToken(req.token)
  .then(()=>{
    res.status(200).send()
  })
  .catch((e)=>res.status(400).send(e))
})
module.exports = router
