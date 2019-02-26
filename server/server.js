const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const lodash = require('lodash');

const config = require('./config/config');
const {mongoose} = require('./db/mongooseConfig');
const {userModel} = require('./models/user')
const {todoModel} = require('./models/todo')

var app = express();
app.use(bodyParser.json())

app.post('/todos',(req,res)=>{
  //Handling the POST requests
  var todoNote = new todoModel({
    name: req.body.name
  })
  todoNote.save().then((doc)=>{
    res.status(200).send(doc)
  },(err)=>{
    res.status(400).send(err)
  })
})
app.get('/todos',(req,res)=>{
  todoModel.find({}).then((results)=>res.status(200).send({results}),(err)=>res.status(400).send(err))
})
app.get('/todos/:passedId',(req,res)=>{
  var passedId = req.params.passedId;
  if(!ObjectID.isValid(passedId)) return res.status(400).send('ID is not valid')

  todoModel.findById(passedId).then((doc)=>{
    if(!doc) return res.status(404).send('no todo found with such id');
    return res.status(200).send(doc);

  }).catch((e)=>{
    return res.status(400).send('Error occured when trying to fetch');
  })
})
app.delete('/todos/:passedId',(req,res)=>{
  var passedId = req.params.passedId;
  if(!ObjectID.isValid(passedId)) return res.status(400).send('ID is not valid')

  todoModel.findByIdAndDelete(passedId).then((doc)=>{
    if(!doc) return res.status(404).send('no todo found with such id');
    return res.status(200).send(doc);

  }).catch((e)=>{
    return res.status(400).send('Error occured when trying to fetch');
  })
})
app.patch('/todos/:passedId',(req,res)=>{
  var id = req.params.passedId
  var body = lodash.pick(req.body,['name','completed'])
  if(!ObjectID.isValid(id)) return res.status(404).send();
  if(lodash.isBoolean(body.completed) && body.completed) body.completedAt = new Date().getTime()
  else{
    body.completed = false
    body.completedAt = null
  }
  todoModel.findByIdAndUpdate(id,{$set: body},{new: true})
  .then((todo)=> {
    if(!todo) return res.status(404).send();
    res.status(200).send(todo);
  })
  .catch((err)=>{
    res.status(400).send();
  })

})
app.listen(process.env.PORT, console.log('Ready'));

module.exports = {
  app
}
