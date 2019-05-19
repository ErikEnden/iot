require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const moment = require('moment')
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
app.use(cors())
app.get('/', function (request, response) {
  response.sendStatus('200')
  response.send('hello')
})

app.get('/light-level', function (request, response) {
  let luxString = curLux.toString()
  response.send(luxString)
  response.sendStatus(200)
})

app.get('/light-level-hist', function (request, response) {
  if (!request.query.page && !request.query.perPage && !request.query.startDate && !request.query.endDate) {
    db.many('SELECT * FROM ' + process.env.TABLE_NAME + ' ORDER BY time DESC LIMIT 303')
      .then(function (res) {
        response.send(res)
      })
      .catch(function (error) {
        console.log(error)
      })
  } else {
    let perPage = 303
    let startDate = '1970-01-01 00:00:00+00'
    let endDate = moment().format('YYYY-MM-DD HH:mm:ss+00')
    if (request.query.perPage) {
      perPage = request.query.perPage
    }
    if (request.query.startDate) {
      startDate = request.query.startDate
    }
    if (request.query.endDate) {
      endDate = request.query.endDate
    }
    let queryString = 'SELECT * FROM ' + process.env.TABLE_NAME + ' ORDER BY time DESC LIMIT ' + perPage + ' WHERE time > ' + startDate + ' AND time < ' + endDate
    if (request.query.page) {
      queryString = queryString + ' OFFSET ' + (perPage * request.query.page + 1)
    }
    db.many(queryString).then(function (res) {
      response.send(res)
    }).catch(function (error) {
      console.log(error)
    })
  }
})

app.get('/light-level-hist/all', function (request, response) {
  console.log(request.query)
  db.many('SELECT * FROM ' + process.env.TABLE_NAME + ' ORDER BY time DESC')
    .then(function (res) {
      response.send(res)
    })
    .catch(function (error) {
      console.log(error)
    })
})

app.post('/update-level', function (request, response) {
  console.log(request.body)
  curLux = request.body.luxlevel
  let sensMode = request.body.sensormode
  let measurementId = request.body.measurement
  console.log(request.body.luxlevel)
  db.none('INSERT INTO "' + process.env.TABLE_NAME + '"(sensor_reading, sensor_filter_mode, measurement_id) VALUES (${luxLevel}, ${sensorMode}, ${measurement})', {
    luxLevel: curLux,
    sensorMode: sensMode,
    measurement: measurementId
  }).then(function (response) {
    console.log(response)
  }).catch(function (error) {
    console.log(error)
  })
  response.sendStatus(200)
})

app.listen(port, () => console.log('App listening on ' + port))
