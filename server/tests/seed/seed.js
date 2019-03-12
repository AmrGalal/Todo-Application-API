const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {todoModel} = require('./../../models/todo');
const {userModel} = require('./../../models/user');

var todoNotes = [{_id:new ObjectID(),name:'Some test text 1',completed:true,completedAt:333},
{_id:new ObjectID(),name:'Some test text 2',completed:false}]

var userOneId = new ObjectID();
var userTwoId = new ObjectID();
var todoUsers = [{
  _id: userOneId,
  email:'amr@example.com',
  password: 'userOnePass',
  tokens:[{
    access:'auth',
    token: jwt.sign({_id:userOneId.toHexString(),access:'auth'},'abc123').toString()
  }]
},{
  _id:userTwoId,
  email: 'hamada@example.com',
  password: 'userTwoPass'
}]

const populateTodos = (done)=>{
  todoModel.deleteMany({}).then(()=>{
    return todoModel.insertMany(todoNotes)
  }).then(()=>done())
}

const populateUsers = (done)=>{
  userModel.deleteMany({}).then(()=>{
    var userOne = new userModel(todoUsers[0]).save();
    var userTwo = new userModel(todoUsers[1]).save();

    return Promise.all([userOne,userTwo]) //wait for both the promises to end
  }).then(()=>done())
}

module.exports = {populateTodos,populateUsers,todoNotes,todoUsers}
