var Util = require('./util');
var Db = require('mongodb').Db,
	MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID,
	Server = require('mongodb').Server,
	crypto = require('crypto'),
	Zip = require('node-zip'),
	log4js = require('log4js'),
	logger = log4js.getLogger();

// See docs @ http://mongodb.github.io/node-mongodb-native/

var Notes = Util.Class({

	init: function(db) {
		this._db = db;
	},

	getTree: function(req, resp) {
		var folders = this._db.collection('folders');
		var notes = this._db.collection('notes');

		var tree = [];

		var c = 0, ready = false;

		folders.find({user: req.session.username}).toArray(function(err, docs) {
			if (err) {
				logger.error(err);
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
	},

	dump: function(req, resp) {
		var notes = this._db.collection('notes');

		notes.find({user: req.session.username}).toArray(function(err, noteDocs) {
			var zip = new Zip();

			noteDocs.forEach(function(noteItem) {
				zip.file(noteItem.name + '.md', noteItem.content);
			}.bind(this))

			resp.end(zip.generate({base64: false, compression: 'DEFLATE'}), 'binary');
		});
	},

	addNote: function(req, resp) {
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
	},

	deleteNote: function(req, resp) {
		var notes = this._db.collection('notes');

		notes.remove({_id: new ObjectID(req.body.note)}, true);

		resp.end(JSON.stringify({
			success: true
		}));
	},

	getContent: function(req, resp) {
		var notes = this._db.collection('notes');

		notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
			if (err || !item) {
				logger.error(err);
				resp.end(500, "Could not retrieve content");
				return;
			}

			resp.end(JSON.stringify(item));
		}.bind(this));
	},

	saveContent: function(req, resp) {
		var notes = this._db.collection('notes');

		notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
			if (err || !item) {
				logger.error(err);
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
	},

	saveName: function(req, resp) {
		var notes = this._db.collection('notes');

		notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
			if (err || !item) {
				logger.error(err);
				resp.end(500, "Could not save note name");
				return;
			}

			item.name = req.body.name;

			notes.save(item);

			resp.end(JSON.stringify({
				success: true
			}));
		}.bind(this));
	},

	move: function(req, resp) {
		var notes = this._db.collection('notes');

		notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err, item) {
			if (err || !item) {
				logger.error(err);
				resp.end(500, "Could not move note");
				return;
			}

			item.parent = req.body.parent ? new ObjectID(req.body.parent) : null;

			notes.save(item);

			resp.end(JSON.stringify({
				success: true
			}));
		}.bind(this));
	}
});

module.exports = Notes;