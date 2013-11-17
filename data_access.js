var util = require('./util');
var Db = require('mongodb').Db,
	MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID,
	Server = require('mongodb').Server,
	crypto = require('crypto'),
	Zip = require('node-zip'),
	deferred = require('deferred');

// See docs @ http://mongodb.github.io/node-mongodb-native/

var DataAccess = new util.Class();

DataAccess.defaultOptions({
	host: 'localhost',
	port: 27017,
	name: 'marky'
});

DataAccess.field('_db', null);

DataAccess.method('connect', function() {
	this._db = new Db(this.options.name, new Server(this.options.host, this.options.port), {safe: false});
	
	this._db.open(function(err, db) {
		if (!err) {
			console.log("Connected to mongo!");
		} else {
			console.error(err);
		}
	}.bind(this));
});

DataAccess.method('checkUser', function(username, token, callback) {
	var users = this._db.collection('users'),
		hashes = this._db.collection('hashes');
	
	if (!username || !token) {
		if (callback) callback(new Error('No token specified for authentication'));
		return;
	}
	
	users.findOne({username: username}, function(err, user) {
		if (err || !user) {
			console.error(err);
			if (callback) callback(new Error('Could not retrieve user'));
			return;
		}
		
		if (!user.salt) {
			console.error('No salt set for user - not authenticated');
			if (callback) callback(new Error('No salt set for user - not authenticated'));
			return;
		}
		
		var sha512 = crypto.createHash('sha512');
		sha512.update(user.salt + token);
		
		hashes.findOne({hash: sha512.digest('hex')}, function(err, item) {
			if (err || !user) {
				console.error(err);
				
				// Validation failed - invalidate existing token immediately
				user.salt = null;
				users.save(user);
				
				if (callback) callback(new Error('Could not validate token'));
				return;
			}
			
			if (callback) callback(null, true);
		});
	}.bind(this));
});

DataAccess.method('updateUser', function(githubUser, token, callback) {
	var users = this._db.collection('users');
	var findOneUser = deferred.promisify(users.findOne).bind(users),
		insertUser = deferred.promisify(users.insert).bind(users);
	
	findOneUser({username: githubUser.login})(function(item) {
		this._doUpdateUser(item, githubUser, token, callback);
	}.bind(this), function(err) {
		insertUser({
			username: githubUser.login,
			github_id: githubUser.id,
			email: githubUser.email,
			name: githubUser.name
		}, {w: 1})(function(result) {
			this._doUpdateUser(result, githubUser, token, callback);
		}.bind(this), function(err) {
			console.error(err.stack);
			resp.end(500, "Error creating user");
			return;
		}.bind(this));
		
		return;
	}.bind(this));
});

DataAccess.method('_doUpdateUser', function(user, githubUser, token, callback) {
	var users = this._db.collection('users'),
		hashes = this._db.collection('hashes'),
		insertHash = deferred.promisify(hashes.insert).bind(hashes);
	
	user.salt = crypto.randomBytes(256);
	users.save(user);
	
	var sha512 = crypto.createHash('sha512');
	sha512.update(user.salt + token);
	
	insertHash({
		hash: sha512.digest('hex')
	}, {w: 1})(function(result) {
		callback(null, result);
	}, function(err) {
		console.error(err.stack);
		resp.end(500, "Error creating user");
		return;
	});
});

DataAccess.method('clearUser', function(username, callback) {
	var users = this._db.collection('users');
	users.findOne({username: username}, function(err, user) {
		if (err || !user) {
			log.error(err);
			
			if (callback) callback(err);
			return;
		}
		
		user.salt = null;
		users.save(user);
		if (callback) callback(null, true);
	}.bind(this));
});

DataAccess.method('getTree', function(req, resp) {
	var folders = this._db.collection('folders');
	var notes = this._db.collection('notes');
	
	var tree = [];
	
	var c = 0, ready = false;
		
	folders.find({user: req.session.username}).toArray(function(err, docs) {
		if (err) {
			console.error(err.stack);
			resp.end(500, "Error retrieving tree");
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

DataAccess.method('dump', function(req, resp) {
	var notes = this._db.collection('notes');
	
	notes.find({user: req.session.username}).toArray(function(err, noteDocs) {
		var zip = new Zip();
		
		noteDocs.forEach(function(noteItem) {
			zip.file(noteItem.name + '.md', noteItem.content);
		}.bind(this))
		
		resp.end(zip.generate({base64: false, compression: 'DEFLATE'}), 'binary');
	});
});

DataAccess.method('getFolders', function(req, resp) {
	var folders = this._db.collection('folders');
	
	folders.find({user: req.session.username}).toArray(function(err, docs) {
		if (err) {
			console.error(err.stack);
			resp.end(500, "Error retrieving folders");
			return;
		}
		
		resp.end(JSON.stringify(docs));
	});
});

DataAccess.method('addNote', function(req, resp) {
	// name, parent
	var notes = this._db.collection('notes');
	
	var o = {
		name: req.body.name,
		parent: req.body.parent,
		content: '',
		user: req.session.username
	};
	
	// _id generated automatically
	notes.insert(o, {w: 1}, function(err, result) {
		resp.end(JSON.stringify(o));
	});
});

DataAccess.method('addFolder', function(req, resp) {
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

DataAccess.method('deleteNote', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.remove({_id: new ObjectID(req.body.note)}, true);
	
	resp.end(JSON.stringify({
		success: true
	}));
});

DataAccess.method('deleteFolder', function(req, resp) {
	var folders = this._db.collection('folders');
	var notes = this._db.collection('notes');
	
	notes.find({parent: new ObjectID(req.body.folder), user: req.session.username}).toArray(function(err, noteDocs) {
		if (err || !noteDocs) {
			console.error(err.stack);
			resp.end(500, "Could not delete folder");
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

DataAccess.method('getContent', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err.stack);
			resp.end(500, "Could not retrieve content");
			return;
		}
		
		resp.end(JSON.stringify(item));
	}.bind(this));
});

DataAccess.method('saveContent', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err.stack);
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

DataAccess.method('saveName', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err.stack);
			resp.end(500, "Could not save note name");
			return;
		}
		
		item.name = req.body.name;
		
		notes.save(item);
		
		resp.end(JSON.stringify({
			success: true
		}));
	}.bind(this));
});

DataAccess.method('renameFolder', function(req, resp) {
	var folders = this._db.collection('folders');
		
	folders.findOne({_id: new ObjectID(req.body.folder), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err.stack);
			resp.end(500, "Could not rename folder");
			return;
		}
		
		item.name = req.body.name;
		
		folders.save(item);
		
		resp.end(JSON.stringify({
			success: true
		}));
	}.bind(this));
});

DataAccess.method('saveColour', function(req, resp) {
	var folders = this._db.collection('folders');
		
	folders.findOne({_id: new ObjectID(req.body.folder), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err.stack);
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

DataAccess.method('move', function(req, resp) {
	var notes = this._db.collection('notes');
		
	notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
		if (err || !item) {
			console.error(err.stack);
			resp.end(500, "Could not move note");
			return;
		}
		
		item.parent = req.body.parent ? new ObjectID(req.body.parent) : null;
		
		notes.save(item);
		
		resp.end(JSON.stringify({
			success: true
		}));
	}.bind(this));
});

exports.DataAccess = DataAccess;