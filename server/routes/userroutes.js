const express = require('express');
const lodash = require('lodash');

const {userModel} = require('../models/user')

var router = express.Router()

router.post('/users',(req,res)=>{
  var body = lodash.pick(req.body,['email','password'])
  var user = new userModel(body)
  user.save().then((results)=>{
    res.status(200).send(results)
  }).catch((e)=>res.status(400).send(e))
})

module.exports = router
