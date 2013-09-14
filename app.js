#!/usr/bin/nodejs

//require('mootools');
require('./util');
var express = require('express');
var MarkyDB = require('./db').MarkyDB;
var config = require('./config.json');

var app = express();

app.configure(function() {
	app.use(express.basicAuth(function(user, pass) {
		return user === 'admin' && pass === 'admin123';
	}));
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});

//app.post('/json/')

var db = MarkyDB.create(config.db);
db.connect();

app.post('/download', db.dump);
//app.post('/note/get', db.getNote);
app.post('/note/add', db.addNote);
app.post('/note/delete', db.deleteNote);
app.post('/note/content/get', db.getContent);
app.post('/note/content/save', db.saveContent);
app.post('/note/rename', db.saveName);
app.post('/note/move', db.move);
app.post('/folder/tree', db.getTree);
app.post('/folder/list', db.getFolders);
app.post('/folder/add', db.addFolder);
app.post('/folder/colour', db.saveColour);


//app.post('/json/', authFunc,)

//resp.redirect() ??

app.listen(config.port); // TODO Configurable
console.log('Now listening on port 3000...');