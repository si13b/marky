var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

var MarkyDB = new Class({
	Implements: [Options, Events],

	Binds: [
		'_get',
		'_getJSON',
		'getTree',
		'dump',
		'getFolders',
		'getNote',
		'addNote',
		'addFolder',
		'deleteNote',
		'saveColour',
		'saveContent',
		'saveName',
		'move'
	],

	options: {
		host: 'localhost',
		port: 27017,
		name: 'marky'
	},
	
	_db: null,

	initialize: function(options) {
		this.setOptions(options);
	},
	
	_get: function(name, callback) {
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
	},
	
	_getJSON: function(req) {
		try {
			return JSON.parse(req.body);
		} catch (e) {
			return null;
		}
	},
	
	getTree: function(req, resp) {
		console.log('Getting tree');
		this._get('public', function(error, col) {
			console.log('Responding...');
			resp.end(JSON.stringify({msg: "Get tree!\n"}));
		}.bind(this));
	},
	
	dump: function(req, resp) {
		this._get('public', function(error, col) {
			resp.end("Download!\n");
		}.bind(this));
	},
	
	getFolders: function(req, resp) {
		this._get('public', function(error, col) {
			resp.end("Get folders!\n");
		}.bind(this));
	},
	
	addNote: function(req, resp) {
		var json = this._getJSON(req);
		if (!json) {
			resp.writeHead('500', {'Content-Type': 'text/json'});
			resp.end("Error\n");
			console.log('Error, JSON could not be parsed');
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
	},
	
	addFolder: function(req, resp) {
		
	},
	
	deleteNote: function(req, resp) {
		
	},
	
	getNote: function(req, resp) {
		
	},
	
	saveContent: function(req, resp) {
		
	},
	
	saveName: function(req, resp) {
		
	},
	
	saveColour: function(req, resp) {
		
	},
	
	move: function(req, resp) {
		
	}
});

exports.MarkyDB = MarkyDB;