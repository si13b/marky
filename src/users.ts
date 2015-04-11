///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/mongodb/mongodb.d.ts' />
///<reference path='../typings/body-parser/body-parser.d.ts' />
///<reference path='../typings/cookie-parser/cookie-parser.d.ts' />
///<reference path='../typings/express-session/express-session.d.ts' />
///<reference path='../typings/log4js/log4js.d.ts' />

import MongoDB = require('mongodb');
import log4js = require('log4js');
import Notes = require('./notes');

var crypto = require('crypto'),
	Zip = require('node-zip'),
	logger = log4js.getLogger();

export interface User {
	_id?: MongoDB.ObjectID;
	salt?: string;
	name: string;
	username: string;
	email: string;
}

/**
 * Class for managing requests and data access for user data.
 */
export class Handler {
	private _db: MongoDB.Db;

	constructor(db: MongoDB.Db) {
		this._db = db;
	}

	/**
	 * Retrieve the given user from the database and pass the object to the callback.
	 *
	 * @param username
	 * @param callback
	 */
	getUser(username: string, callback: Function) {
		var users = this._db.collection('users');

		if (!callback) return;

		if (!username) {
			callback(new Error('No token specified for authentication'));
			return;
		}

		users.findOne({username: username}, callback);
	}

	/**
	 * Check if the given username and password is valid. The check is considered to be passed if no error is
	 * passed through to the callback.
	 *
	 * @param username
	 * @param password
	 * @param callback
	 */
	checkUser(username: string, password: string, callback: Function) {
		var users: MongoDB.Collection = this._db.collection('users'),
			hashes: MongoDB.Collection = this._db.collection('hashes'),
			thisUser: User = null;

		if (!callback) return;

		if (!username || !password) {
			callback(new Error('No token specified for authentication'));
			return;
		}

		users.findOne({username: username}, function(err: Error, user: User) {
			if (err || !user) {
				logger.error(err.toString());
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

		var onHashFound = function(err: Error, item) {
			if (err || !item) {
				logger.error(err.toString());

				callback(new Error('Could not validate token'));
				return;
			}

			callback(null, true);
		}.bind(this)

	}

	/**
	 * If the given user does not exist, then create it, otherwise update the details of the given user and create a
	 * new hash for the supplied password.
	 *
	 * @param login
	 * @param email
	 * @param name
	 * @param password
	 * @param callback
	 */
	updateUser(login: string, email: string, name: string, password: string, callback: Function) {
		var users: MongoDB.Collection = this._db.collection('users');
		users.findOne({username: login}, function(err, item) {
			if (err || !item) {
				var newUser: User = {
					username: login,
					email: email,
					name: name
				};

				users.insert(newUser, {w: 1}, function(err: Error, result: User[]) {
					if (err || !result || !result.length) {
						logger.error(err.toString());
						// resp.end(500, "Error creating user");
						return;
					}

					this._doUpdateUser(result[0], password, callback);
				}.bind(this));

				return;
			}

			this._doUpdateUser(item, password, callback);
		}.bind(this));
	}

	/**
	 * Having retrieved and/or created the given user, update the details of the given user and create a
	 * new hash for the supplied password.
	 *
	 * @param user
	 * @param password
	 * @param callback
	 * @private
	 */
	_doUpdateUser(user: User, password: string, callback: Function) {
		var users: MongoDB.Collection = this._db.collection('users'),
			hashes: MongoDB.Collection = this._db.collection('hashes');

		user.salt = crypto.randomBytes(256);
		users.save(user, null);

		var sha512 = crypto.createHash('sha512');
		sha512.update(user.salt + password);

		hashes.insert({
			hash: sha512.digest('hex')
		}, {w: 1}, function(err: Error, result) {
			if (err) {
				logger.error(err.toString());
				// resp.end(500, "Error creating user");
				return;
			}

			if (callback) callback(err, true);
		});
	}
}