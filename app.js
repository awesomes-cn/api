var express = require('express')
var app = express()
var router = require('./lib/router')
var bodyParser = require('body-parser')
var login = require('./middleware/login')

app.use(bodyParser.json())

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, atoken')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
app.use(login)

app.use(router)

app.listen(5010)
