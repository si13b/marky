var util = require('./util');
var pg = require('pg');

var MarkyDB = new util.Class();

MarkyDB.defaultOptions({
	host: 'localhost',
	port: 5432,
	name: 'marky'
});

MarkyDB.field('_db', null);

MarkyDB.method('connect', function() {
	var conString = 'postgres://marky:' + this.options.port + '@' + this.options.host + '/' + this.options.name;
	
	this._db = new pg.Client(conString);
	this._db.connect(function(err) {
		if (err) {
			console.error('could not connect to postgres', err);
			this._db = null;
			return;
		}
		console.log('Connected');
	}.bind(this));
});

MarkyDB.method('_getJSON', function(text) {
	try {
		return JSON.parse(text);
	} catch (e) {
		console.dir(e);
		return null;
	}
});
	
MarkyDB.method('getTree', function(req, resp) {
	resp.end("Get tree!\n");
});

MarkyDB.method('dump', function(req, resp) {
	resp.end("Download!\n");
});

MarkyDB.method('getFolders', function(req, resp) {
	
});

MarkyDB.method('addNote', function(req, resp) {
	
});

MarkyDB.method('addFolder', function(req, resp) {
	
});

MarkyDB.method('deleteNote', function(req, resp) {
	
});

MarkyDB.method('getNote', function(req, resp) {
	
});

MarkyDB.method('saveContent', function(req, resp) {
	
});

MarkyDB.method('saveName', function(req, resp) {
	
});

MarkyDB.method('saveColour', function(req, resp) {
	
});

MarkyDB.method('move', function(req, resp) {
	
});

exports.MarkyDB = MarkyDB;