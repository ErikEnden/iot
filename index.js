/* eslint-disable no-template-curly-in-string */
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
    let queryString = 'SELECT * FROM ' + process.env.TABLE_NAME
    if (request.query.perPage) {
      perPage = request.query.perPage
    }
    if (request.query.startDate || request.query.endDate) {
      queryString += ' WHERE '
      if (request.query.startDate) {
        startDate = request.query.startDate
        if (request.query.startTime) {
          startDate = startDate + ' ' + request.query.startTime + '+00'
        }
        queryString += 'time > ' + "'" + startDate + "'"
        if (request.query.endDate) {
          queryString += ' AND '
          endDate = request.query.endDate
          if (request.query.endTime) {
            endDate = endDate + ' ' + request.query.endTime + '+00'
          }
          queryString += 'time < ' + "'" + endDate + "'"
        }
      } else if (request.query.endDate) {
        if (request.query.endDate) {
          endDate = request.query.endDate
          if (request.query.endTime) {
            endDate = endDate + ' ' + request.query.endTime + '+00'
          }
        }
        queryString += 'time < ' + endDate
      }
    }
    queryString += ' ORDER BY time DESC LIMIT ' + perPage
    console.log(queryString)
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
  if (!request.query.startDate && !request.query.endDate) {
    db.many('SELECT * FROM ' + process.env.TABLE_NAME + ' ORDER BY time DESC')
      .then(function (res) {
        response.send(res)
      })
      .catch(function (error) {
        console.log(error)
      })
  } else {
    let startDate = '1970-01-01 00:00:00+00'
    let endDate = moment().format('YYYY-MM-DD HH:mm:ss+00')
    if (request.query.startDate) {
      startDate = request.query.startDate
      if (request.query.startTime) {
        startDate = startDate + ' ' + request.query.startTime + '+00'
      }
    }
    if (request.query.endDate) {
      endDate = request.query.startDate
      if (request.query.endTime) {
        endDate = endDate + ' ' + request.query.endTime + '+00'
      }
    }
    db.many('SELECT * FROM ' + process.env.TABLE_NAME + ' ORDER BY time DESC WHERE time < ' + endDate + ' AND time > ' + startDate)
      .then(function (res) {
        response.send(res)
      })
      .catch(function (error) {
        console.log(error)
      })
  }
})

app.post('/save-query', function (request, response) {
  console.log(request.query)
  db.none('INSERT INTO iotapp_savedqueries (query, chart_type) VALUES (${queryString}, ${chartType})', {
    queryString: request.query.queryString,
    chartType: request.query.chartType
  }).then(function (response) {
    console.log(response)
  }).catch(function (error) {
    console.log(error)
  })
  response.sendStatus(200)
})
app.get('/saved-queries', function (request, response) {
  db.many('SELECT * FROM iotapp_savedqueries').then(function (response) {
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
