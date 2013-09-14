var util = require('./util');
var Db = require('mongodb').Db,
	MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID,
	Server = require('mongodb').Server;

// See docs @ http://mongodb.github.io/node-mongodb-native/

var MarkyDB = new util.Class();

MarkyDB.defaultOptions({
	host: 'localhost',
	port: 27017,
	name: 'marky'
});

MarkyDB.field('_db', null);

MarkyDB.method('connect', function() {
	this._db = new Db(this.options.name, new Server(this.options.host, this.options.port));
	
	this._db.open(function(err, db) {
		if (!err) {
			console.log("Connected to mongo!");
		} else {
			console.error(err);
		}
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
	var folders = this._db.collection('folders');
	var notes = this._db.collection('notes');
	
	var tree = [];
	
	var c = 0, ready = false;
		
	folders.find().toArray(function(err, docs) {
		if (err) {
			console.error(err);
			resp.end(err); // TODO Ick
			return;
		}
		
		docs.forEach(function(folderItem) {
			var o = {
				_id: folderItem._id,
				name: folderItem.name,
				colour: folderItem.colour,
				folder: true
			};
			
			console.dir(o);
		
			tree.push(o);
			
			c++;
			notes.find({folder: folderItem._id, user: 'admin'}).toArray(function(err, noteDocs) {
				c--;
				if (!o.items) o.items = [];
				
				o.items.push({
					_id: noteDocs._id,
					name: noteDocs.name,
					content: noteDocs.content
				});
				
				if (ready && !c) resp.end(JSON.stringify(tree));
			});
		}.bind(this));
		
		c++;
		notes.find({user: 'admin'}).toArray(function(err, noteDocs) {
			c--;
			
			console.dir(noteDocs);
			
			noteDocs.forEach(function(noteItem) {
				if (noteItem.folder) return;
				tree.push({
					_id: noteItem._id,
					name: noteItem.name,
					content: noteItem.content
				});
			}.bind(this))
			
			if (ready && !c) resp.end(JSON.stringify(tree));
		});
		
		ready = true;
	}.bind(this));
});

MarkyDB.method('dump', function(req, resp) {
	resp.end("Download!\n");
});

MarkyDB.method('getFolders', function(req, resp) {
	
});

MarkyDB.method('addNote', function(req, resp) {
	// name, parent
	var notes = this._db.collection('notes');
	
	var o = {
		name: req.body.name,
		parent: req.body.parent,
		content: '',
		user: 'admin' // TODO - Real users
	} // TODO key for user
	
	// _id generated automatically
	notes.insert(o, {w: 1}, function(err, result) {
		resp.end(JSON.stringify(o));
	});
});

MarkyDB.method('addFolder', function(req, resp) {
	
});

MarkyDB.method('deleteNote', function(req, resp) {
	
});

MarkyDB.method('getContent', function(req, resp) {
	var notes = this._db.collection('notes');
		
	console.log('getting content for: ' + req.body.note);
		
	notes.findOne({_id: req.body.note}, function(err, item) {
		if (err) {
			console.error(err);
			resp.end(err); // TODO Ick
			return;
		}
		
		resp.end(JSON.stringify({
			content: item.content
		}));
	}.bind(this));
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