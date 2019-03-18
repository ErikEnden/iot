require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const app = express()
const moment = require('moment')
const port = 3000

const db = pgp('postgres://' + 
    process.env.DB_USER + ':' + 
    process.env.DB_PASSWORD + '@' + 
    process.env.DB_HOST + ':' + 
    process.env.DB_PORT + '/' + 
    process.env.DB_NAME
)
const modes = ['none', 'red', 'blue']
let curLux = 0
let mode = 'none'

app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function(request, response){
    response.send('hi')
})

app.get('/light-level', function(request, response){
    luxString = curLux.toString()
    response.send(luxString)
})

app.get('/light-level-hist', function(request, response){
  db.many('SELECT * FROM ' + process.env.TABLE_NAME)
  .then(function(res){
    response.send(res)
  })
})

app.get('/current-mode', function(request, response){
  response.send(mode)
})

app.post('/update-level', function(request, response){
    console.log(request.body)
    curLux = request.body.luxlevel
    sensMode = request.body.sensormode
    console.log(request.body.luxlevel)
    db.none('INSERT INTO "' + process.env.TABLE_NAME + '"(sensor_reading, sensor_filter_mode) VALUES(${luxLevel}, ${sensorMode})', {
      luxLevel: curLux,
      sensorMode: sensMode
    }).then(function(response){
      console.log(response)
    })
    response.send(200)
})

app.post('/change-mode', function(request, response){
  if(modes.indexOf(request.body.mode) !== -1){
    mode = request.body.mode
    response.send(200)
  } else {
    console.log('invalid mode specified, doing nothing!')
    response.send(500)
  }
})

app.listen(port, () => console.log('App listening on ' + port))