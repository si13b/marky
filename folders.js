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

var Folders = Util.Class({
	init: function(db) {
		this._db = db;
	},

	getFolders: function(req, resp) {
		var folders = this._db.collection('folders');

		folders.find({user: req.session.username}).toArray(function(err, docs) {
			if (err) {
				logger.error(err);
				resp.end(500, "Error retrieving folders");
				return;
			}

			resp.end(JSON.stringify(docs));
		});
	},

	addFolder: function(req, resp) {
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
	},

	deleteFolder: function(req, resp) {
		var folders = this._db.collection('folders');
		var notes = this._db.collection('notes');

		notes.find({parent: new ObjectID(req.body.folder), user: req.session.username}).toArray(function(err, noteDocs) {
			if (err || !noteDocs) {
				logger.error(err);
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
	},

	renameFolder: function(req, resp) {
		var folders = this._db.collection('folders');

		folders.findOne({_id: new ObjectID(req.body.folder), user: req.session.username}, function(err, item) {
			if (err || !item) {
				logger.error(err);
				resp.end(500, "Could not rename folder");
				return;
			}

			item.name = req.body.name;

			folders.save(item);

			resp.end(JSON.stringify({
				success: true
			}));
		}.bind(this));
	},

	saveColour: function(req, resp) {
		var folders = this._db.collection('folders');

		folders.findOne({_id: new ObjectID(req.body.folder), user: req.session.username}, function(err, item) {
			if (err || !item) {
				logger.error(err);
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
	}
});

module.exports = Folders;