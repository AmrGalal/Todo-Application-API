const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {todoModel} = require('./../../models/todo');
const {userModel} = require('./../../models/user');


var userOneId = new ObjectID();
var userTwoId = new ObjectID();
var todoNotes = [{_id:new ObjectID(),name:'Some test text 1',completed:true,completedAt:333,_creator:userOneId},
{_id:new ObjectID(),name:'Some test text 2',completed:false,_creator:userTwoId}]
var todoUsers = [{
  _id: userOneId,
  email:'amr@example.com',
  password: 'userOnePass',
  tokens:[{
    access:'auth',
    token: jwt.sign({_id:userOneId.toHexString(),access:'auth'},process.env.JWT_KEY).toString()
  }]
},{
  _id:userTwoId,
  email: 'hamada@example.com',
  password: 'userTwoPass',
  tokens:[{
    access:'auth',
    token: jwt.sign({_id:userTwoId.toHexString(),access:'auth'},process.env.JWT_KEY).toString()
  }]
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
