const mocha = require('mocha');
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {todoModel} = require('./../models/todo');
const {userModel} = require('./../models/user');
const {populateTodos,populateUsers,todoNotes,todoUsers} = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
  it('should work as expected and create a new todo',(done)=>{
    var name = 'Test todo text'
    //supertest will convert the object to json
    request(app)
    .post('/todos')
    .set('x-auth',todoUsers[0].tokens[0].token)
    .send({name})
    .expect(200)
    .expect((res)=>{
      expect(res.body.name).toBe(name);
    })
    .expect('Content-Type', /json/)
    .end((err,res)=>{
      if(err) return done(err);
      todoModel.find({name}).then((res)=>{
        expect(res.length).toBe(1)
        expect(res[0].name).toBe(name)
        done()
      })
      .catch((err)=>done(err));
    })
  })
  it('should return an error when having bad data',(done)=>{
      var notName = 'test string'
      request(app)
      .post('/todos')
      .set('x-auth',todoUsers[0].tokens[0].token)
      .send({notName})
      .expect(400)
      .end((err,res)=>{
        if(err) return done(err);
        todoModel.find({})
        .then((res)=>{
          expect(res.length).toBe(2)
          done()
        })
        .catch((err)=>done(err))
      })
  })
});
describe('GET /todos',()=>{
  it('should get all todos',(done)=>{
    request(app).get('/todos')
    .set('x-auth',todoUsers[0].tokens[0].token)
    .expect(200)
    .expect((res)=>{
      expect(res.body.results.length).toBe(1)
    })
    .end(done)
  })
})
describe('GET /todos/:passedId',()=>{
  it('should return a 200 with the right object when we pass a correct ID ',(done)=>{
    request(app).get(`/todos/${todoNotes[0]._id.toHexString()}`)
    .set('x-auth',todoUsers[0].tokens[0].token)
    .expect(200)
    .expect((res)=>{
      expect(res.body.name).toBe(todoNotes[0].name)
    })
    .end(done)
  })
  it('should return a 404 with a valid ID but not found in the db',(done)=>{
    var hexID = new ObjectID().toHexString();
    request(app).get(`/todos/${hexID}`)
    .set('x-auth',todoUsers[0].tokens[0].token).expect(404).end(done)
  })
  it('should return a 400 with a non-valid ID',(done)=>{
    request(app).get(`/todos/123`).set('x-auth',todoUsers[0].tokens[0].token).expect(400).end(done)
  })
})
describe('DELETE /todos/:passedId',()=>{
  it('should return a 200 with the right object when we pass a correct ID ',(done)=>{
    var hexID = todoNotes[0]._id.toHexString()
    request(app).delete(`/todos/${hexID}`)
    .set('x-auth',todoUsers[0].tokens[0].token)
    .expect(200)
    .expect((res)=>{
      expect(res.body.name).toBe(todoNotes[0].name)
      expect(res.body._id).toBe(hexID)
    })
    .end((err,res)=>{
      if(err) return done(err);
      todoModel.findById(hexID).then((res)=>{
        expect(res).toNotExist()
        done()
      })
      .catch((e)=>done(e))
    })
  })
  it('should return a 404 with a valid ID but not found in the db',(done)=>{
    var hexID = new ObjectID().toHexString();
    request(app).delete(`/todos/${hexID}`)
    .set('x-auth',todoUsers[0].tokens[0].token)
    .expect(404).end(done)
  })
  it('should return a 400 with a non-valid ID',(done)=>{
    request(app).delete(`/todos/123`)
    .set('x-auth',todoUsers[0].tokens[0].token)
    .expect(400).end(done)
  })
})
describe('PATCH /todos/:passedId', () => {
  it('should return 200 with valid id, set completed to true, change name, set time to completedAt', (done)=>{
    var hexID = todoNotes[1]._id.toHexString();
    var name = 'updates from the tester'
    request(app).patch(`/todos/${hexID}`)
    .set('x-auth',todoUsers[1].tokens[0].token)
    .send({name,completed:true,completedAt:1234})
    .expect(200)
    .expect((res)=>{
        expect(res.body.name).toBe(name)
        expect(res.body.completed).toBe(true)
        expect(res.body.completedAt).toExist();
    })
    .end((err,res)=>{
      if(err) return done(err);
      todoModel.findById(hexID).then((res)=>{
        expect(res.name).toBe(name)
        expect(res.completed).toBe(true)
        expect(res.completedAt).toExist();
        done()
      })
      .catch((err)=>done(err))
    })
  })
  it('should return a 200 with a valid ID, tick completed to false and set completedAt to null',(done)=>{
    var hexID = todoNotes[0]._id.toHexString();
    request(app).patch(`/todos/${hexID}`)
    .set('x-auth',todoUsers[0].tokens[0].token)
    .send({completed:false})
    .expect(200)
    .expect((res)=>{
      expect(res.body.completed).toBe(false);
      expect(res.body.completedAt).toNotExist()
    })

    .end((err,res)=>{
      if(err) return done(err);
      todoModel.findById(hexID).then((res)=>{
        expect(res.completedAt).toNotExist()
        expect(res.completed).toBe(false);
        done()
      })
      .catch((err)=>done(err))
    })
  })

  it('should return a 404 with a valid ID but not found in the db',(done)=>{
    var hexID = new ObjectID().toHexString();
    request(app).get(`/todos/${hexID}`)
    .set('x-auth',todoUsers[0].tokens[0].token)
    .expect(404).end(done)
  })

  it('should return a 400 with a non-valid ID',(done)=>{
    request(app).get(`/todos/123`)
    .set('x-auth',todoUsers[0].tokens[0].token)
    .expect(400).end(done)
  })
});
describe('GET /users/me',()=>{
  it('should authenticate given the right data',(done)=>{
    request(app).get('/users/me')
    .set('x-auth',todoUsers[0].tokens[0].token)
    .expect(200)
    .expect((res)=>{
      expect(res.body.email).toBe(todoUsers[0].email);
      expect(res.body._id).toBe(todoUsers[0]._id.toHexString())
    })
    .end(done)
  })

  it('should not authenticate given the wrong data',(done)=>{
    request(app).get('/users/me')
    .expect(401)
    .expect((res)=>{
      expect(res.body).toEqual({});
    })
    .end(done)
  })
})
describe('POST /users',()=>{
  it('should not create a user if email is in use ', (done)=>{
    request(app).post('/users')
    .send({
      email:todoUsers[0].email,
      password: 'password'
    })
    .expect(400)
    .end(done)
  })
  it('should return validation errors if request invalid', (done)=>{
    request(app).post('/users')
    .send({
      email:'and',
      password: 'password'
    })
    .expect(400)
    .end(done)
  })
  it('should create a user',(done)=>{
    var email = 'test3@test.com'
    var password = 'password'
    request(app).post('/users')
    .send({
      email,
      password
    })
    .expect((res)=>{
      expect(res.headers['x-auth']).toExist();
      expect(res.body.email).toBe(email);
      expect(res.body._id).toExist()
    })
    .expect(200)
    .end((err)=>{
      if(err) return done(err);
      userModel.findOne({email})
      .then((results)=>{
        expect(results).toExist()
        expect(results.email).toBe(email)
        expect(results.password).toNotBe(password)
        done();
      })
    })

  })
})
describe('POST /users/login',()=>{
  it('should return a 404 when email isn\'t valid',(done)=>{
    request(app).post('/users/login')
    .send({
      email: 'test@test.com',
      password: 'admin123'
    })
    .expect((res)=>{
      token =res.headers['x-auth']
      expect(token).toNotExist();
    })
    .expect(400)
    .end(done)
  })

  it('should return a 404 when password isn\'t matching',(done)=>{
    request(app).post('/users/login')
    .send({
      email: 'amr@example.com',
      password: 'wrongPassword'
    })
    .expect((res)=>{
      token =res.headers['x-auth']
      expect(token).toNotExist();
    })
    .expect(400)
    .end(done)
  })

  it('should return a 200 and a token when credentials are correct',(done)=>{
    var email = todoUsers[1].email
    var password = todoUsers[1].password
    var token;
    request(app).post('/users/login')
    .send({email, password})
    .expect((res)=>{
      token =res.headers['x-auth']
      expect(token).toExist();
    })
    .expect(200)
    .end((err)=>{
      if(err) return done(err);
      userModel.findByToken(token)
      .then((user)=>{
        expect(user.email).toBe(email)
        done();
      })
    })
  })
})
describe('DELETE /users/me/token',()=>{
  it('should remove the token upon logout',(done)=>{
    var token = todoUsers[0].tokens[0].token
    request(app).delete('/users/me/token')
    .set('x-auth',token)
    .expect((res)=>{
      tokenReceived =res.headers['x-auth']
      expect(tokenReceived).toNotExist();
    })
    .expect(200)
    .end((err)=>{
      if(err) return done(err);
      userModel.findById(todoUsers[0]._id)
      .then((results)=>{
        expect(results.tokens.length).toBe(0);
        done();
      })
      .catch((e)=> done(e))
    })
  })

})
