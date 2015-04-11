///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/mongodb/mongodb.d.ts' />
///<reference path='../typings/body-parser/body-parser.d.ts' />
///<reference path='../typings/cookie-parser/cookie-parser.d.ts' />
///<reference path='../typings/express-session/express-session.d.ts' />
///<reference path='../typings/log4js/log4js.d.ts' />

import MongoDB = require('mongodb');
import log4js = require('log4js');

var Db = MongoDB.Db,
	MongoClient = MongoDB.MongoClient,
	ObjectID = MongoDB.ObjectID,
	Server = MongoDB.Server,
	crypto = require('crypto'),
	Zip = require('node-zip'),
	logger = log4js.getLogger();

// See docs @ http://mongodb.github.io/node-mongodb-native/

export interface TreeItem {
	_id?: MongoDB.ObjectID;
	name: string;
	parent?: MongoDB.ObjectID;
	user?: string;
}

export interface Note extends TreeItem {
	content: string;
}

export interface Folder extends TreeItem {
	colour?: string;
	folder: boolean;
	items: Note[]
}

/**
 * Class for handling requests and data access for notes and the tree of notes and folders.
 */
export class Handler {
	private _db: MongoDB.Db;

	constructor(db: MongoDB.Db) {
		this._db = db;
	}

	/**
	 * Retrieve the full tree of notes and folders for the current user.
	 *
	 * @param req
	 * @param resp
	 */
	getTree(req, resp) {
		var folders: MongoDB.Collection = this._db.collection('folders');
		var notes: MongoDB.Collection = this._db.collection('notes');

		var tree: TreeItem[] = [];

		var c = 0, ready = false;

		folders.find({user: req.session.username}).toArray(function(err: Error, docs: Folder[]) {
			if (err) {
				logger.error(err.message);
				resp.end(500, "Error retrieving tree");
				return;
			}

			docs.forEach(function(folderItem: Folder) {
				var o: Folder = {
					_id: folderItem._id,
					name: folderItem.name,
					colour: folderItem.colour,
					folder: true,
					items: null,
					bill: ''
				};

				c++;
				notes.find({parent: folderItem._id, user: req.session.username}).toArray(function(err: Error, noteDocs: Note[]) {
					c--;
					if (!o.items) o.items = [];

					noteDocs.forEach(function(noteItem: Note) {
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
			notes.find({user: req.session.username}).toArray(function(err: Error, noteDocs: Note[]) {
				c--;

				noteDocs.forEach(function(noteItem: Note) {
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
	}

	/**
	 * Dump all notes for the current user as a ZIP binary for download.
	 *
	 * @param req
	 * @param resp
	 */
	dump(req, resp) {
		var notes: MongoDB.Collection = this._db.collection('notes');

		notes.find({user: req.session.username}).toArray(function(err: Error, noteDocs) {
			if (err || !item) {
				logger.error(err.toString());
				resp.end(500, "Could not retrieve content");
				return;
			}

			var zip = new Zip();

			noteDocs.forEach(function(noteItem: Note) {
				zip.file(noteItem.name + '.md', noteItem.content);
			}.bind(this))

			resp.end(zip.generate({base64: false, compression: 'DEFLATE'}), 'binary');
		});
	}

	/**
	 * Create a new note in the database with the given name and parent.
	 *
	 * @param req
	 * @param resp
	 */
	addNote(req, resp) {
		// name, parent
		var notes: MongoDB.Collection = this._db.collection('notes');

		var o: Note = {
			name: req.body.name,
			parent: req.body.parent,
			content: '',
			user: req.session.username
		};

		// _id generated automatically
		notes.insert(o, {w: 1}, function(err: Error, result) {
			resp.end(JSON.stringify(o));
		});
	}

	/**
	 *
	 * @param req
	 * @param resp
	 */
	deleteNote(req, resp) {
		var notes: MongoDB.Collection = this._db.collection('notes');

		notes.remove({_id: new ObjectID(req.body.note)}, true);

		resp.end(JSON.stringify({
			success: true
		}));
	}

	getContent(req, resp) {
		var notes: MongoDB.Collection = this._db.collection('notes');

		notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err: Error, item: Note) {
			if (err || !item) {
				logger.error(err.toString());
				resp.end(500, "Could not retrieve content");
				return;
			}

			resp.end(JSON.stringify(item));
		}.bind(this));
	}

	saveContent(req, resp) {
		if (!req || !req.body || !req.body.note) {
			resp.end(JSON.stringify({
				success: true
			}));
			return;
		}

		var notes: MongoDB.Collection = this._db.collection('notes');

		notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err: Error, item: Note) {
			if (err || !item) {
				logger.error(err.toString());
				resp.end(JSON.stringify({
					error: err || 'Object is null'
				}));
				return;
			}

			item.content = req.body.content;

			notes.save(item, null);

			resp.end(JSON.stringify({
				success: true
			}));
		}.bind(this));
	}

	saveName(req, resp) {
		var notes: MongoDB.Collection = this._db.collection('notes');

		notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err: Error, item: Note) {
			if (err) throw err;
			/*if (err || !item) {
				logger.error(err.toString());
				resp.end(500, "Could not save note name");
				return;
			}*/

			item.name = req.body.name;

			notes.save(item, null);

			resp.end(JSON.stringify({
				success: true
			}));
		}.bind(this));
	}

	move(req, resp) {
		var notes: MongoDB.Collection = this._db.collection('notes');

		notes.findOne({_id: new ObjectID(req.body.note), user: req.session.username}, function(err: Error, item: Note) {
			if (err || !item) {
				logger.error(err.toString());
				resp.end(500, "Could not move note");
				return;
			}

			item.parent = req.body.parent ? new ObjectID(req.body.parent) : null;

			notes.save(item, null);

			resp.end(JSON.stringify({
				success: true
			}));
		}.bind(this));
	}
}