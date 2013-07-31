//require('mootools');
var express = require('express');
var actions = require('./actions');

var app = express();

app.use(express.static(__dirname + '/public'));

//app.get('/json/')

app.get('/test/', actions.test);
app.get('/save/', actions.save);

//app.post('/json/', authFunc,)

app.listen(3000);