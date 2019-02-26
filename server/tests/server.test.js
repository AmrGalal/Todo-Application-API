const mocha = require('mocha');
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {todoModel} = require('./../models/todo');
//const {userModel} = require('./../models/user');

var todoNotes = [{_id:new ObjectID(),name:'Some test text 1',completed:true,completedAt:333},
{_id:new ObjectID(),name:'Some test text 2',completed:false}]
//var todoUsers = [{email:'testSystem@sys.com'}]

beforeEach((done)=>{
  todoModel.deleteMany({}).then(()=>{
    return todoModel.insertMany(todoNotes)
  }).then(()=>done())
})

describe('POST /todos', () => {
  it('should work as expected and create a new todo',(done)=>{
    var name = 'Test todo text'
    //supertest will convert the object to json
    request(app)
    .post('/todos')
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
    request(app).get('/todos').expect(200)
    .expect((res)=>{
      expect(res.body.results.length).toBe(2)
    })
    .end(done)
  })
})
describe('GET /todos/:passedId',()=>{
  it('should return a 200 with the right object when we pass a correct ID ',(done)=>{
    request(app).get(`/todos/${todoNotes[0]._id.toHexString()}`)
    .expect(200)
    .expect((res)=>{
      expect(res.body.name).toBe(todoNotes[0].name)
    })
    .end(done)
  })
  it('should return a 404 with a valid ID but not found in the db',(done)=>{
    var hexID = new ObjectID().toHexString();
    request(app).get(`/todos/${hexID}`).expect(404).end(done)
  })
  it('should return a 400 with a non-valid ID',(done)=>{
    request(app).get(`/todos/123`).expect(400).end(done)
  })
})
describe('DELETE /todos/:passedId',()=>{
  it('should return a 200 with the right object when we pass a correct ID ',(done)=>{
    var hexID = todoNotes[0]._id.toHexString()
    request(app).delete(`/todos/${hexID}`)
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
    request(app).delete(`/todos/${hexID}`).expect(404).end(done)
  })
  it('should return a 400 with a non-valid ID',(done)=>{
    request(app).delete(`/todos/123`).expect(400).end(done)
  })
})
describe('PATCH /todos/:passedId', () => {
  it('should return 200 with valid id, set completed to true, change name, set time to completedAt', (done)=>{
    var hexID = todoNotes[1]._id.toHexString();
    var name = 'updates from the tester'
    request(app).patch(`/todos/${hexID}`).send({name,completed:true,completedAt:1234})
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
    request(app).patch(`/todos/${hexID}`).send({completed:false}).expect(200)
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
    request(app).get(`/todos/${hexID}`).expect(404).end(done)
  })

  it('should return a 400 with a non-valid ID',(done)=>{
    request(app).get(`/todos/123`).expect(400).end(done)
  })
});
