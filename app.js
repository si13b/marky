//require('mootools');
require('mootools');
require('mootools-more');
var express = require('express');
var MarkyDB = require('./db').MarkyDB;

var app = express();

app.configure(function() {
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});

//app.get('/json/')

var db = new MarkyDB({ // TODO Configurable
	host: 'localhost',
	port: 27017, 
	name: 'marky'
});

app.get('/tree/get', db.getTree);
app.get('/download', db.dump);
app.get('/folders/get', db.getFolders);
app.get('/note/get', db.getNote);
app.get('/note/add', db.addNote);
app.get('/note/delete', db.deleteNote);
app.get('/folder/add', db.addFolder);
app.get('/colour/save', db.saveColour);
app.get('/content/save', db.saveContent);
app.get('/name/save', db.saveName);
app.get('/move', db.move);

//app.post('/json/', authFunc,)

//resp.redirect() ??

app.listen(3000); // TODO Configurable
console.log('Now listening on port 3000...');