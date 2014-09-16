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

var Users = Util.Class({

	init: function(db) {
		this._db = db;
	},

	getUser: function(username, callback) {
		var users = this._db.collection('users');

		if (!callback) return;

		if (!username) {
			callback(new Error('No token specified for authentication'));
			return;
		}

		users.findOne({username: username}, callback);
	},

	checkUser: function(username, password, callback) {
		var users = this._db.collection('users'),
			hashes = this._db.collection('hashes'),
			thisUser = null;

		if (!callback) return;

		if (!username || !password) {
			callback(new Error('No token specified for authentication'));
			return;
		}

		users.findOne({username: username}, function(err, user) {
			if (err || !user) {
				logger.error(err);
				callback(new Error('Could not retrieve user'));
				return;
			}

			thisUser = user;

			if (!user.salt) {
				logger.error('No salt set for user - not authenticated');
				callback(new Error('No salt set for user - not authenticated'));
				return;
			}

			var sha512 = crypto.createHash('sha512');
			sha512.update(user.salt + password);

			hashes.findOne({hash: sha512.digest('hex')}, onHashFound);
		});

		var onHashFound = function(err, item) {
			if (err || !item) {
				logger.error(err);

				callback(new Error('Could not validate token'));
				return;
			}

			callback(null, true);
		}.bind(this)

	},

	updateUser: function(login, email, name, password, callback) {
		var users = this._db.collection('users');
		users.findOne({username: login}, function(err, item) {
			if (err || !item) {
				users.insert({
					username: login,
					email: email,
					name: name
				}, {w: 1}, function(err, result) {
					if (err || !result || !result.length) {
						logger.error(err);
						resp.end(500, "Error creating user");
						return;
					}

					this._doUpdateUser(result[0], password, callback);
				}.bind(this));

				return;
			}

			this._doUpdateUser(item, password, callback);
		}.bind(this));
	},

	_doUpdateUser: function(user, password, callback) {
		var users = this._db.collection('users'),
			hashes = this._db.collection('hashes');

		user.salt = crypto.randomBytes(256);
		users.save(user);

		var sha512 = crypto.createHash('sha512');
		sha512.update(user.salt + password);

		hashes.insert({
			hash: sha512.digest('hex')
		}, {w: 1}, function(err, result) {
			if (err) {
				logger.error(err);
				resp.end(500, "Error creating user");
				return;
			}

			if (callback) callback(err, true);
		});
	},

	clearUser: function(username, callback) {
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
	}
});

module.exports = Users;