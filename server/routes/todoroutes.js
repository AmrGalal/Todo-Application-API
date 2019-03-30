const express = require('express');
const lodash = require('lodash');
const {ObjectID} = require('mongodb');

const {todoModel} = require('../models/todo')
const {authenticate} = require('../middleware/authenticate');
var router = express.Router()

router.post('/todos',authenticate,(req,res)=>{
  //Handling the POST requests
  var todoNote = new todoModel({
    name: req.body.name,
    _creator: req.user._id
  })
  todoNote.save().then((doc)=>{
    res.status(200).send(doc)
  },(err)=>{
    res.status(400).send(err)
  })
})
router.get('/todos',authenticate,(req,res)=>{
  todoModel.find({_creator: req.user._id}).then((results)=>res.status(200).send({results}),(err)=>res.status(400).send(err))
})

router.get('/todos/:passedId',authenticate,(req,res)=>{
  var passedId = req.params.passedId;
  if(!ObjectID.isValid(passedId)) return res.status(400).send('ID is not valid')

  todoModel.findOne({_id:passedId, _creator:req.user._id}).then((doc)=>{
    if(!doc) return res.status(404).send('no todo found with such id');
    return res.status(200).send(doc);

  }).catch((e)=>{
    return res.status(400).send('Error occured when trying to fetch');
  })
})
router.delete('/todos/:passedId',authenticate,(req,res)=>{
  var passedId = req.params.passedId;
  if(!ObjectID.isValid(passedId)) return res.status(400).send('ID is not valid')

  todoModel.findOneAndRemove({_id:passedId, _creator:req.user._id}).then((doc)=>{
    if(!doc) return res.status(404).send('no todo found with such id');
    return res.status(200).send(doc);

  }).catch((e)=>{
    return res.status(400).send('Error occured when trying to fetch');
  })
})
router.patch('/todos/:passedId',authenticate,(req,res)=>{
  var id = req.params.passedId
  var body = lodash.pick(req.body,['name','completed'])
  if(!ObjectID.isValid(id)) return res.status(404).send();
  if(lodash.isBoolean(body.completed) && body.completed) body.completedAt = new Date().getTime()
  else{
    body.completed = false
    body.completedAt = null
  }
  console.log('here');
  todoModel.findOneAndUpdate(({_id:id, _creator:req.user._id}),{$set: body},{new: true})
  .then((todo)=> {
    if(!todo) return res.status(404).send();
    res.status(200).send(todo);
  })
  .catch((err)=>{
    res.status(400).send();
  })
})

module.exports = router
