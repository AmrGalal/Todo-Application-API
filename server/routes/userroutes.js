const express = require('express');
const lodash = require('lodash');

const {userModel} = require('../models/user')

var router = express.Router()

router.post('/users',(req,res)=>{
  var body = lodash.pick(req.body,['email','password'])
  var user = new userModel(body)
  user.save()
  .then(()=>{
    return user.generateAuthToken();
  })
  .then((token)=>{
    res.header('x-auth',token).status(200).send(user)
  })
  .catch((e)=>res.status(400).send(e))
})

module.exports = router
