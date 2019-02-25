const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

let curLux = 0

app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function(request, response){
    response.send('hi')
})

app.get('/light-level', function(request, response){
    luxString = curLux.toString()
    response.send(luxString)
})

app.post('/update-level', function(request, response){
    curLux = request.body.luxlevel
    response.send('wow u did it congrats nice job')
})

app.listen(port, () => console.log('it works yo'))