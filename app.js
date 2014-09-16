#!/usr/bin/nodejs

require('./util');
var express = require('express'),
	Notes = require('./notes'),
	Folders = require('./folders'),
	Users = require('./users'),
	Auth = require('./auth'),
	config = require('./config.json'),
	querystring = require('querystring'),
	log4js = require('log4js'),
	logger = log4js.getLogger(),
	Db = require('mongodb').Db,
	Server = require('mongodb').Server;

var db = new Db(config.db.name, new Server(config.db.host, config.db.port), {safe: false});
db.open(function(err, db) {
	if (err) {
		logger.error(err);
		return;
	}

	logger.info('Connected to Mongo');
});

var app = express();

var users = new Users(db),
	folders = new Folders(db),
	notes = new Notes(db);
	auth = new Auth(users);

app.configure(function() {
	app.use(express.bodyParser());
	app.use(express.cookieParser(config.cookieSecret)); // Secure config?
	app.use(express.session());
	app.use(express.static(__dirname + '/public'));
	app.use(function(req, res, next) {
		logger.info(req.method + ' ' + req.url);
		next();
	});
});

app.post('/login', auth.check, function(req, res) {
	res.redirect('app.html');
});
app.post('/signup', auth.signup);
app.post('/logout', auth.logout);
app.post('/download', auth.check, notes.dump);
app.post('/note/add', auth.check, notes.addNote);
app.post('/note/delete', auth.check, notes.deleteNote);
app.post('/note/content/get', auth.check, notes.getContent);
app.post('/note/content/save', auth.check, notes.saveContent);
app.post('/note/rename', auth.check, notes.saveName);
app.post('/note/move', auth.check, notes.move);
app.post('/folder/tree', auth.check, notes.getTree);
app.post('/folder/list', auth.check, folders.getFolders);
app.post('/folder/delete', auth.check, folders.deleteFolder);
app.post('/folder/rename', auth.check, folders.renameFolder);
app.post('/folder/add', auth.check, folders.addFolder);
app.post('/folder/colour', auth.check, folders.saveColour);

app.listen(config.port);
console.log('Now listening on port 3000...');