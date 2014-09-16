#!/usr/bin/nodejs

require('./util');
var express = require('express'),
	DataAccess = require('./data_access').DataAccess,
	Auth = require('./auth').Auth,
	config = require('./config.json'),
	querystring = require('querystring'),
	log4js = require('log4js'),
	logger = log4js.getLogger(),
	dataAccess = DataAccess.create(config.db);

dataAccess.connect();


var app = express();

var auth = Auth.create();
auth.setDataAccess(dataAccess);

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
app.post('/download', auth.check, dataAccess.dump);
app.post('/note/add', auth.check, dataAccess.addNote);
app.post('/note/delete', auth.check, dataAccess.deleteNote);
app.post('/note/content/get', auth.check, dataAccess.getContent);
app.post('/note/content/save', auth.check, dataAccess.saveContent);
app.post('/note/rename', auth.check, dataAccess.saveName);
app.post('/note/move', auth.check, dataAccess.move);
app.post('/folder/tree', auth.check, dataAccess.getTree);
app.post('/folder/list', auth.check, dataAccess.getFolders);
app.post('/folder/delete', auth.check, dataAccess.deleteFolder);
app.post('/folder/rename', auth.check, dataAccess.renameFolder);
app.post('/folder/add', auth.check, dataAccess.addFolder);
app.post('/folder/colour', auth.check, dataAccess.saveColour);

app.listen(config.port);
console.log('Now listening on port 3000...');