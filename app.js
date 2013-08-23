//require('mootools');
require('./util');
var express = require('express');
var MarkyDB = require('./db').MarkyDB;

var app = express();

app.configure(function() {
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});

//app.get('/json/')

var db = MarkyDB.create({ // TODO Configurable
	host: 'localhost',
	port: 27017, 
	name: 'marky'
});

app.get('/download', db.dump);
app.get('/note/get', db.getNote);
app.get('/note/add', db.addNote);
app.get('/note/delete', db.deleteNote);
app.get('/note/content', db.saveContent);
app.get('/note/rename', db.saveName);
app.get('/note/move', db.move);
app.get('/folder/tree', db.getTree);
app.get('/folder/list', db.getFolders);
app.get('/folder/add', db.addFolder);
app.get('/folder/colour', db.saveColour);


//app.post('/json/', authFunc,)

//resp.redirect() ??

app.listen(3000); // TODO Configurable
console.log('Now listening on port 3000...');