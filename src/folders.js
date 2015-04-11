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
 * Class for handling requests pertaining to folders
 */
var Handler = (function () {
    function Handler(db) {
        this._db = db;
    }
    Handler.prototype.getFolders = function (req, resp) {
        var folders = this._db.collection('folders');
        folders.find({ user: req.session.username }).toArray(function (err, docs) {
            if (err) {
                logger.error(err.toString());
                resp.end(500, "Error retrieving folders");
                return;
            }
            resp.end(JSON.stringify(docs));
        });
    };
    Handler.prototype.addFolder = function (req, resp) {
        var folders = this._db.collection('folders');
        var o = {
            name: req.body.name,
            folder: true,
            user: req.session.username,
            items: []
        };
        // _id generated automatically
        folders.insert(o, { w: 1 }, function (err, result) {
            resp.end(JSON.stringify(o));
        });
    };
    Handler.prototype.deleteFolder = function (req, resp) {
        var folders = this._db.collection('folders');
        var notes = this._db.collection('notes');
        notes.find({ parent: new ObjectID(req.body.folder), user: req.session.username }).toArray(function (err, noteDocs) {
            if (err || !noteDocs) {
                logger.error(err.toString());
                resp.end(500, "Could not delete folder");
                return;
            }
            noteDocs.forEach(function (noteItem) {
                noteItem.parent = null;
                notes.save(noteItem, null);
            }.bind(this));
            folders.remove({ _id: new ObjectID(req.body.folder) }, true);
            resp.end(JSON.stringify({
                success: true
            }));
        });
    };
    Handler.prototype.renameFolder = function (req, resp) {
        var folders = this._db.collection('folders');
        folders.findOne({ _id: new ObjectID(req.body.folder), user: req.session.username }, function (err, item) {
            if (err || !item) {
                logger.error(err.toString());
                resp.end(500, "Could not rename folder");
                return;
            }
            item.name = req.body.name;
            folders.save(item, null);
            resp.end(JSON.stringify({
                success: true
            }));
        }.bind(this));
    };
    Handler.prototype.saveColour = function (req, resp) {
        var folders = this._db.collection('folders');
        folders.findOne({ _id: new ObjectID(req.body.folder), user: req.session.username }, function (err, item) {
            if (err || !item) {
                logger.error(err.toString());
                resp.end(JSON.stringify({
                    error: err || 'Object is null'
                }));
                return;
            }
            item.colour = req.body.colour;
            folders.save(item, null);
            resp.end(JSON.stringify({
                success: true
            }));
        }.bind(this));
    };
    return Handler;
})();
exports.Handler = Handler;
//# sourceMappingURL=folders.js.map