var express = require('express')
var app = express()
var router = require('./lib/router')
var bodyParser = require('body-parser')
var login = require('./middleware/login')
var busboy = require('connect-busboy')

app.use(busboy())

app.use(bodyParser.json({limit: '10mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '10mb', extended: true }));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, atoken, token')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
app.use(login)

app.use(router)

app.listen(5010)
