const express = require('express')

const router = express.Router()

const todosByUser = {}

router.post('/', (req, res, next) => {
  const todo = [...req.body.todo || []]
  if (req.body.remove) todo.splice(req.body.remove, 1)
  if (req.body.new) todo.push({})

  todosByUser[req.userContext.userinfo.sub] = todo

  console.log("NXT GW ::: Auth post middleware");
  next()
})

router.use('/', (req, res) => {
  const todo = todosByUser[req.userContext.userinfo.sub] || []

  res.json({ title: 'Registration Successful!', todo, userinfo: req.userContext.userinfo });
  console.log("NXT GW ::: Auth Use middleware");
  console.log(req.userContext);
})

module.exports = router
