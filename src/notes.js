///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/mongodb/mongodb.d.ts' />
///<reference path='../typings/body-parser/body-parser.d.ts' />
///<reference path='../typings/cookie-parser/cookie-parser.d.ts' />
///<reference path='../typings/express-session/express-session.d.ts' />
///<reference path='../typings/log4js/log4js.d.ts' />
var MongoDB = require('mongodb');
var log4js = require('log4js');
var Db = MongoDB.Db, MongoClient = MongoDB.MongoClient, ObjectID = MongoDB.ObjectID, Server = MongoDB.Server, crypto = require('crypto'), Zip = require('node-zip'), logger = log4js.getLogger();
/**
 * Class for handling requests and data access for notes and the tree of notes and folders.
 */
var Handler = (function () {
    function Handler(db) {
        this._db = db;
    }
    /**
     * Retrieve the full tree of notes and folders for the current user.
     *
     * @param req
     * @param resp
     */
    Handler.prototype.getTree = function (req, resp) {
        var folders = this._db.collection('folders');
        var notes = this._db.collection('notes');
        var tree = [];
        var c = 0, ready = false;
        folders.find({ user: req.session.username }).toArray(function (err, docs) {
            if (err) {
                logger.error(err.message);
                resp.end(500, "Error retrieving tree");
                return;
            }
            docs.forEach(function (folderItem) {
                var o = {
                    _id: folderItem._id,
                    name: folderItem.name,
                    colour: folderItem.colour,
                    folder: true,
                    items: null,
                    bill: ''
                };
                c++;
                notes.find({ parent: folderItem._id, user: req.session.username }).toArray(function (err, noteDocs) {
                    c--;
                    if (!o.items)
                        o.items = [];
                    noteDocs.forEach(function (noteItem) {
                        o.items.push({
                            _id: noteItem._id,
                            name: noteItem.name,
                            content: noteItem.content
                        });
                    }.bind(this));
                    if (ready && !c)
                        resp.end(JSON.stringify(tree));
                });
                tree.push(o);
            }.bind(this));
            c++;
            notes.find({ user: req.session.username }).toArray(function (err, noteDocs) {
                c--;
                noteDocs.forEach(function (noteItem) {
                    if (noteItem.parent)
                        return;
                    tree.push({
                        _id: noteItem._id,
                        name: noteItem.name,
                        content: noteItem.content
                    });
                }.bind(this));
                if (ready && !c)
                    resp.end(JSON.stringify(tree));
            });
            ready = true;
        }.bind(this));
    };
    /**
     * Dump all notes for the current user as a ZIP binary for download.
     *
     * @param req
     * @param resp
     */
    Handler.prototype.dump = function (req, resp) {
        var notes = this._db.collection('notes');
        notes.find({ user: req.session.username }).toArray(function (err, noteDocs) {
            if (err || !item) {
                logger.error(err.toString());
                resp.end(500, "Could not retrieve content");
                return;
            }
            var zip = new Zip();
            noteDocs.forEach(function (noteItem) {
                zip.file(noteItem.name + '.md', noteItem.content);
            }.bind(this));
            resp.end(zip.generate({ base64: false, compression: 'DEFLATE' }), 'binary');
        });
    };
    /**
     * Create a new note in the database with the given name and parent.
     *
     * @param req
     * @param resp
     */
    Handler.prototype.addNote = function (req, resp) {
        // name, parent
        var notes = this._db.collection('notes');
        var o = {
            name: req.body.name,
            parent: req.body.parent,
            content: '',
            user: req.session.username
        };
        // _id generated automatically
        notes.insert(o, { w: 1 }, function (err, result) {
            resp.end(JSON.stringify(o));
        });
    };
    /**
     *
     * @param req
     * @param resp
     */
    Handler.prototype.deleteNote = function (req, resp) {
        var notes = this._db.collection('notes');
        notes.remove({ _id: new ObjectID(req.body.note) }, true);
        resp.end(JSON.stringify({
            success: true
        }));
    };
    Handler.prototype.getContent = function (req, resp) {
        var notes = this._db.collection('notes');
        notes.findOne({ _id: new ObjectID(req.body.note), user: req.session.username }, function (err, item) {
            if (err || !item) {
                logger.error(err.toString());
                resp.end(500, "Could not retrieve content");
                return;
            }
            resp.end(JSON.stringify(item));
        }.bind(this));
    };
    Handler.prototype.saveContent = function (req, resp) {
        if (!req || !req.body || !req.body.note) {
            resp.end(JSON.stringify({
                success: true
            }));
            return;
        }
        var notes = this._db.collection('notes');
        notes.findOne({ _id: new ObjectID(req.body.note), user: req.session.username }, function (err, item) {
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
    };
    Handler.prototype.saveName = function (req, resp) {
        var notes = this._db.collection('notes');
        notes.findOne({ _id: new ObjectID(req.body.note), user: req.session.username }, function (err, item) {
            if (err)
                throw err;
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
    };
    Handler.prototype.move = function (req, resp) {
        var notes = this._db.collection('notes');
        notes.findOne({ _id: new ObjectID(req.body.note), user: req.session.username }, function (err, item) {
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
    };
    return Handler;
})();
exports.Handler = Handler;
//# sourceMappingURL=notes.js.map