const {userModel} = require('../models/user')
var authenticate = (req,res,next)=>{
  var token = req.header('x-auth')
  userModel.findByToken(token)
  .then((user)=>{
    if(!user) throw "This token wasn't found"
    req.user = user;
    req.token = token;
    next();
  })
  .catch((e)=> res.status(401).send())
}
module.exports = {
  authenticate
}
