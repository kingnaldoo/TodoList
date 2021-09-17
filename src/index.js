const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express(); 

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const indexOfUser = users.map(value => value.username == username).indexOf(true);

  if(indexOfUser == -1) {
    return response.status(404).json({error: "User account not exists"})
  }

  request.user = users[indexOfUser]; 

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userCheck = users.find(value => value.username == username);
  if(userCheck) {
    return response.status(400).json({error: "This username has already exists"})
  }
  const user = { 
    id: v4(),
    name, 
    username, 
    todos: []
  }
  users.push(user)
  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const todo = { 
    id: v4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;
  const indexOfTodo = user.todos.map(value => value.id == id).indexOf(true);
  if(indexOfTodo == -1){
    return response.status(404).json({error: "This todo is not exists"})
  }
  user.todos[indexOfTodo].title = title;
  user.todos[indexOfTodo].deadline = new Date(deadline);
  return response.json(user.todos[indexOfTodo]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const indexOfTodo = user.todos.map(value => value.id == id).indexOf(true);
  if(indexOfTodo == -1){
    return response.status(404).json({error: "This todo is not exists"})
  }
  user.todos[indexOfTodo].done = true;
  return response.json(user.todos[indexOfTodo]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const indexOfTodo = user.todos.map(value => value.id == id).indexOf(true);
  if(indexOfTodo == -1){
    return response.status(404).json({error: "This todo is not exists"})
  }
  user.todos.splice(indexOfTodo, 1);
  return response.status(204).send();
});

module.exports = app;