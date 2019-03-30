const mongoose = require('mongoose'); // we can just import the default mongoose without connection because config isn't needed here

var todoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim:true,
    min:1
  },
  completed:{
    type: Boolean,
    default:false
  },
  completedAt:{
    type: Number,
    default: null
  },
  _creator:{
    required: true,
    type: mongoose.Schema.Types.ObjectId
  }
})

var todoModel = mongoose.model('Todo',todoSchema)

module.exports = {todoModel}
