///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/express/express.d.ts' />
///<reference path='../typings/mongodb/mongodb.d.ts' />
///<reference path='../typings/body-parser/body-parser.d.ts' />
///<reference path='../typings/cookie-parser/cookie-parser.d.ts' />
///<reference path='../typings/express-session/express-session.d.ts' />
///<reference path='../typings/log4js/log4js.d.ts' />

import express = require('express');
import MongoDB = require('mongodb');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import expressSession = require('express-session');
import log4js = require('log4js');
import Notes = require('./notes');
import Folders = require('./folders');
import Users = require('./users');
import Auth = require('./auth');

interface DBConfig {
	host: string;
	port: number;
	name: string;
}

interface Config {
	port: number;
	db: DBConfig;
	cookieSecret: string;
}

var	config: Config = require('./../config.json'),
	logger = log4js.getLogger(),
	Db = MongoDB.Db,
	Server = MongoDB.Server;

var db = new Db(config.db.name, new Server(config.db.host, config.db.port), {safe: false});

db.open(function(err: Error, db: MongoDB.Db) {
	if (err) {
		logger.error('' + err);
		return;
	}

	logger.info('Connected to Mongo');
});

var app = express();

var users = new Users(db),
	folders = new Folders(db),
	notes = new Notes.Handler(db),
	auth = new Auth.Handler(users);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.cookieSecret));
app.use(expressSession());
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
	logger.info(req.method + ' ' + req.url);
	next();
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