#!/usr/bin/nodejs

//require('mootools');
require('./util');
var express = require('express');
var MarkyDB = require('./db').MarkyDB;
var config = require('./config.json');

var db = MarkyDB.create(config.db);
db.connect();

var app = express();

app.configure(function() {
	/*app.use(express.basicAuth(function(user, pass) {
		return user === 'admin' && pass === 'admin123';
	}));*/
	app.use(express.bodyParser());
	app.use(express.cookieParser('crUjaw3mu4HAWrajuhad7g2yas5avUr3VusWet3UZupRaFaWRu8ugu'));
app.use(express.session());
	app.use(express.static(__dirname + '/public'));
});

function auth(req, res, next) {
	var username = req.session.username || req.body.username;
	var password = req.session.password || req.body.password;
	db.checkUser(username, password, function(success) {
		if (success) {
			// Set the sessions.
			if (!req.session.username) req.session.username = username;
			if (!req.session.password) req.session.password = password;
			console.log('Authenticated as ' + req.session.username);
			next();
		} else {
			console.log('Login failed for ' + req.body.username);
			req.session.error = 'Access denied!';
			res.end(JSON.stringify({unauthenticated: true}));
			//res.redirect("login.html");
		}
	});
}

app.post('/login', auth, function(req, res) {
	console.log('redirecting to app index')
	res.redirect('index.html');
});
app.post('/logout', function(req, res) {
	if (req.session.username) req.session.username = null;
	if (req.session.password) req.session.password = null;
	res.end(JSON.stringify({unauthenticated: true}));
});
app.post('/download', auth, db.dump);
//app.post('/note/get', db.getNote);
app.post('/note/add', auth, db.addNote);
app.post('/note/delete', auth, db.deleteNote);
app.post('/note/content/get', auth, db.getContent);
app.post('/note/content/save', auth, db.saveContent);
app.post('/note/rename', auth, db.saveName);
app.post('/note/move', auth, db.move);
app.post('/folder/tree', auth, db.getTree);
app.post('/folder/list', auth, db.getFolders);
app.post('/folder/delete', auth, db.deleteFolder);
app.post('/folder/rename', auth, db.renameFolder);
app.post('/folder/add', auth, db.addFolder);
app.post('/folder/colour', auth, db.saveColour);


//app.post('/json/', authFunc,)

//resp.redirect() ??

app.listen(config.port); // TODO Configurable
console.log('Now listening on port 3000...');