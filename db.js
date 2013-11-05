var util = require('./util');
var Db = require('mongodb').Db,
	MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID,
	Server = require('mongodb').Server,
	crypto = require('crypto'),
	Zip = require('node-zip');

// See docs @ http://mongodb.github.io/node-mongodb-native/

var MarkyDB = new util.Class();

MarkyDB.defaultOptions({
	host: 'localhost',
	port: 27017,
	name: 'marky'
});

MarkyDB.field('_db', null);

MarkyDB.method('connect', function() {
	this._db = new Db(this.options.name, new Server(this.options.host, this.options.port), {safe: false});
	
	this._db.open(function(err, db) {
		if (!err) {
			console.log("Connected to mongo!");
			
			var users = this._db.collection('users');
			users.findOne({username: 'admin'}, function(err, item) {
				if (err || !item) {
					users.insert({
							username: 'admin',
							password: crypto.createHash('md5').update('admin123').digest("hex")
						}, {w: 1}, function(err, result) {
							return
						}
					);
					return;
				}
			}.bind(this));
			
		} else {
			console.error(err);
		}
	}.bind(this));
});

MarkyDB.method('checkUser', function(username, password, callback) {
	var users = this._db.collection('users');
	
	if (!username || !password) {
		if (callback) callback(false);
		return;
	}
	
	var md5 = crypto.createHash('md5').update(password).digest("hex"); // TODO Salt me
	
	users.findOne({username: username}, function(err, item) {
		if (err || !item) {
			console.error(err);
			if (callback) callback(false);
			return;
		}
		
		if (callback) callback(item.password === md5);
	}.bind(this));
});
	
MarkyDB.method('getTree', function(req, resp) {
	var folders = this._db.collection('folders');
	var notes = this._db.collection('notes');
	
	var tree = [];
	
	var c = 0, ready = false;
		
	folders.find({user: req.session.username}).toArray(function(err, docs) {
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
			
			c++;
			notes.find({parent: folderItem._id, user: req.session.username}).toArray(function(err, noteDocs) {
				c--;
				if (!o.items) o.items = [];
				
				noteDocs.forEach(function(noteItem) {
					o.items.push({
						_id: noteItem._id,
						name: noteItem.name,
						content: noteItem.content
					});
				}.bind(this));
				
				if (ready && !c) resp.end(JSON.stringify(tree));
			});
			
			tree.push(o);
		}.bind(this));
		
		c++;
		notes.find({user: req.session.username}).toArray(function(err, noteDocs) {
			c--;
			
			noteDocs.forEach(function(noteItem) {
				if (noteItem.parent) return;
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
	var notes = this._db.collection('notes');
	
	notes.find({user: req.session.username}).toArray(function(err, noteDocs) {
		var zip = new Zip();
		
		noteDocs.forEach(function(noteItem) {
			zip.file(noteItem.name + '.md', noteItem.content);
		}.bind(this))
		
		resp.end(zip.generate({base64: false, compression: 'DEFLATE'}), 'binary');
	});
});

MarkyDB.method('getFolders', function(req, resp) {
	var folders = this._db.collection('folders');
	
	folders.find({user: req.session.username}).toArray(function(err, docs) {
		if (err) {
			console.error(err);
			resp.end(err); // TODO Ick
			return;
		}
		
		resp.end(JSON.stringify(docs));
	});
});

MarkyDB.method('addNote', function(req, resp) {
	// name, parent
	var notes = this._db.collection('notes');
	
	var o = {
		name: req.body.name,
		parent: req.body.parent,
		content: '',
		user: req.session.username
	} // TODO key for user
	
	// _id generated automatically
	notes.insert(o, {w: 1}, function(err, result) {
		resp.end(JSON.stringify(o));
	});
});

MarkyDB.method('addFolder', function(req, resp) {
	var folders = this._db.collection('folders');
	
	var o = {
		name: req.body.name,
		folder: true,
		user: req.session.username
	} // TODO key for user
	
	// _id generated automatically
	folders.insert(o, {w: 1}, function(err, result) {
		resp.end(JSON.stringify(o));
	});
});

MarkyDB.method('deleteNote', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.remove({_id: new ObjectID(req.body.note)}, true);
	
	resp.end(JSON.stringify({
		success: true
	}));
});

MarkyDB.method('deleteFolder', function(req, resp) {
	var folders = this._db.collection('folders');
	var notes = this._db.collection('notes');
	
	notes.find({parent: new ObjectID(req.body.folder), user: req.session.username}).toArray(function(err, noteDocs) {
		if (err || !noteDocs) {
			console.error(err);
			resp.end(JSON.stringify({
				error: err || 'Object is null'
			}));
			return;
		}
		
		noteDocs.forEach(function(noteItem) {
			noteItem.parent = null;
			
			notes.save(noteItem);
		}.bind(this));
		
		folders.remove({_id: new ObjectID(req.body.folder)}, true);
		
		resp.end(JSON.stringify({
			success: true
		}));
	});
	
	
});

MarkyDB.method('getContent', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err);
			resp.end(JSON.stringify({
				error: err || 'Object is null'
			}));
			return;
		}
		
		resp.end(JSON.stringify(item));
	}.bind(this));
});

MarkyDB.method('saveContent', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err);
			resp.end(JSON.stringify({
				error: err || 'Object is null'
			}));
			return;
		}
		
		item.content = req.body.content;
		
		notes.save(item);
		
		resp.end(JSON.stringify({
			success: true
		}));
	}.bind(this));
});

MarkyDB.method('saveName', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err);
			resp.end(JSON.stringify({
				error: err || 'Object is null'
			}));
			return;
		}
		
		item.name = req.body.name;
		
		notes.save(item);
		
		resp.end(JSON.stringify({
			success: true
		}));
	}.bind(this));
});

MarkyDB.method('renameFolder', function(req, resp) {
	var folders = this._db.collection('folders');
		
	folders.findOne({_id: new ObjectID(req.body.folder), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err);
			resp.end(JSON.stringify({
				error: err || 'Object is null'
			}));
			return;
		}
		
		item.name = req.body.name;
		
		folders.save(item);
		
		resp.end(JSON.stringify({
			success: true
		}));
	}.bind(this));
});

MarkyDB.method('saveColour', function(req, resp) {
	var folders = this._db.collection('folders');
		
	folders.findOne({_id: new ObjectID(req.body.folder), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err);
			resp.end(JSON.stringify({
				error: err || 'Object is null'
			}));
			return;
		}
		
		item.colour = req.body.colour;
		
		folders.save(item);
		
		resp.end(JSON.stringify({
			success: true
		}));
	}.bind(this));
});

MarkyDB.method('move', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err);
			resp.end(JSON.stringify({
				error: err || 'Object is null'
			}));
			return;
		}
		
		item.parent = req.body.parent ? new ObjectID(req.body.parent) : null;
		
		notes.save(item);
		
		resp.end(JSON.stringify({
			success: true
		}));
	}.bind(this));
});

exports.MarkyDB = MarkyDB;