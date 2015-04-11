///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/express/express.d.ts' />
///<reference path='../typings/mongodb/mongodb.d.ts' />
///<reference path='../typings/body-parser/body-parser.d.ts' />
///<reference path='../typings/cookie-parser/cookie-parser.d.ts' />
///<reference path='../typings/express-session/express-session.d.ts' />
///<reference path='../typings/log4js/log4js.d.ts' />
var express = require('express');
var MongoDB = require('mongodb');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var log4js = require('log4js');
var Notes = require('./notes');
var Folders = require('./folders');
var Users = require('./users');
var Auth = require('./auth');
var config = require('./../config.json'), logger = log4js.getLogger(), Db = MongoDB.Db, Server = MongoDB.Server;
var db = new Db(config.db.name, new Server(config.db.host, config.db.port), { safe: false });
db.open(function (err, db) {
    if (err) {
        logger.error('' + err);
        return;
    }
    logger.info('Connected to Mongo');
});
var app = express();
var users = new Users.Handler(db), folders = new Folders.Handler(db), notes = new Notes.Handler(db), auth = new Auth.Handler(users), authChecker = auth.check.bind(auth);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.cookieSecret));
app.use(expressSession());
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
    logger.info(req.method + ' ' + req.url);
    next();
});
app.use(function (err, req, res, next) {
    logger.error('An error occurred: ' + err.stack);
    res.status(500);
    next(err);
});
app.post('/login', authChecker, function (req, res) {
    res.redirect('app.html');
});
app.post('/signup', auth.signup.bind(auth));
app.post('/logout', auth.logout.bind(auth));
app.post('/download', authChecker, notes.dump.bind(notes));
app.post('/note/add', authChecker, notes.addNote.bind(notes));
app.post('/note/delete', authChecker, notes.deleteNote.bind(notes));
app.post('/note/content/get', authChecker, notes.getContent.bind(notes));
app.post('/note/content/save', authChecker, notes.saveContent.bind(notes));
app.post('/note/rename', authChecker, notes.saveName.bind(notes));
app.post('/note/move', authChecker, notes.move.bind(notes));
app.post('/folder/tree', authChecker, notes.getTree.bind(notes));
app.post('/folder/list', authChecker, folders.getFolders.bind(folders));
app.post('/folder/delete', authChecker, folders.deleteFolder.bind(folders));
app.post('/folder/rename', authChecker, folders.renameFolder.bind(folders));
app.post('/folder/add', authChecker, folders.addFolder.bind(folders));
app.post('/folder/colour', authChecker, folders.saveColour.bind(folders));
app.listen(config.port);
console.log('Now listening on port 3000...');
//# sourceMappingURL=app.js.map