require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const app = express()
const port = 3000

const db = pgp('postgres://' +
    process.env.DB_USER + ':' +
    process.env.DB_PASSWORD + '@' +
    process.env.DB_HOST + ':' +
    process.env.DB_PORT + '/' +
    process.env.DB_NAME
)
let curLux = 0

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (request, response) {
  response.sendStatus('hi')
})

app.get('/light-level', function (request, response) {
  let luxString = curLux.toString()
  response.sendStatus(luxString)
})

app.get('/light-level-hist', function (request, response) {
  db.many('SELECT * FROM ' + process.env.TABLE_NAME)
    .then(function (res) {
      console.log(res)
      response.sendStatus(res)
    })
    .catch(function (error) {
      console.log(error)
    })
})

app.post('/update-level', function (request, response) {
  console.log(request.body)
  curLux = request.body.luxlevel
  let sensMode = request.body.sensormode
  console.log(request.body.luxlevel)
  db.none('INSERT INTO "' + process.env.TABLE_NAME + '"(sensor_reading, sensor_filter_mode) VALUES(${luxLevel}, ${sensorMode})', {
    luxLevel: curLux,
    sensorMode: sensMode
  }).then(function (response) {
    console.log(response)
  }).catch(function (error) {
    console.log(error)
  })
  response.sendStatus(200)
})

app.listen(port, () => console.log('App listening on ' + port))
