var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var util = require('./util');

var MarkyDB = new util.Class();

MarkyDB.defaultOptions({
	test: 'hello'
});

MarkyDB.field('_db', null);

MarkyDB.method('_get', function(name, callback) {
	console.log('Getting connection...');
	if (!this._db) {
		console.log('Creating new connection...');
		this._db = new Db(this.options.name, new Server(this.options.host, this.options.port, {auto_reconnect: true}, {}), {safe: true});
		this._db.open(function() {
			this._db.collection(name, callback);
		}.bind(this));
	} else {
		this._db.collection(name, callback);
	}
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
	console.log('Getting tree');
	this._get('public', function(error, col) {
		console.log('Responding...');
		
		// TODO iterate collection result
		//resp.end(JSON.stringify(col));
	}.bind(this));
});

MarkyDB.method('dump', function(req, resp) {
	this._get('public', function(error, col) {
		resp.end("Download!\n");
	}.bind(this));
});

MarkyDB.method('getFolders', function(req, resp) {
	this._get('public', function(error, col) {
		resp.end("Get folders!\n");
	}.bind(this));
});

MarkyDB.method('addNote', function(req, resp) {
	var json = req.query;
	if (!json) {
		resp.writeHead('500', {'Content-Type': 'text/json'});
		resp.end("Error\n");
		console.log('Error, JSON not parsed: ' + json);
		return;
	}
	
	this._get('public', function(error, col) {
		if (error) {
			resp.writeHead('500', {'Content-Type': 'text/json'});
			resp.end("Error\n");
			console.log('Error retrieving the collection');
			return;
		}
		
		var oid = new ObjectID();
		
		col.insert({
			_id: oid,
			name: json.name, // TODO default name?
			parent: json.parent || undefined,
			content: ''
		}, function() {
			resp.writeHead('200', {'Content-Type': 'text/json'});
			resp.end(JSON.stringify({id: oid}));
		});
	}.bind(this));
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