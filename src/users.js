///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/mongodb/mongodb.d.ts' />
///<reference path='../typings/body-parser/body-parser.d.ts' />
///<reference path='../typings/cookie-parser/cookie-parser.d.ts' />
///<reference path='../typings/express-session/express-session.d.ts' />
///<reference path='../typings/log4js/log4js.d.ts' />
var log4js = require('log4js');
var crypto = require('crypto'), Zip = require('node-zip'), logger = log4js.getLogger();
/**
 * Class for managing requests and data access for user data.
 */
var Handler = (function () {
    function Handler(db) {
        this._db = db;
    }
    /**
     * Retrieve the given user from the database and pass the object to the callback.
     *
     * @param username
     * @param callback
     */
    Handler.prototype.getUser = function (username, callback) {
        var users = this._db.collection('users');
        if (!callback)
            return;
        if (!username) {
            callback(new Error('No token specified for authentication'));
            return;
        }
        users.findOne({ username: username }, callback);
    };
    /**
     * Check if the given username and password is valid. The check is considered to be passed if no error is
     * passed through to the callback.
     *
     * @param username
     * @param password
     * @param callback
     */
    Handler.prototype.checkUser = function (username, password, callback) {
        var users = this._db.collection('users'), hashes = this._db.collection('hashes'), thisUser = null;
        if (!callback)
            return;
        if (!username || !password) {
            callback(new Error('No token specified for authentication'));
            return;
        }
        users.findOne({ username: username }, function (err, user) {
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
            hashes.findOne({ hash: sha512.digest('hex') }, onHashFound);
        });
        var onHashFound = function (err, item) {
            if (err || !item) {
                logger.error(err.toString());
                callback(new Error('Could not validate token'));
                return;
            }
            callback(null, true);
        }.bind(this);
    };
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
    Handler.prototype.updateUser = function (login, email, name, password, callback) {
        var users = this._db.collection('users');
        users.findOne({ username: login }, function (err, item) {
            if (err || !item) {
                var newUser = {
                    username: login,
                    email: email,
                    name: name
                };
                users.insert(newUser, { w: 1 }, function (err, result) {
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
    };
    /**
     * Having retrieved and/or created the given user, update the details of the given user and create a
     * new hash for the supplied password.
     *
     * @param user
     * @param password
     * @param callback
     * @private
     */
    Handler.prototype._doUpdateUser = function (user, password, callback) {
        var users = this._db.collection('users'), hashes = this._db.collection('hashes');
        user.salt = crypto.randomBytes(256);
        users.save(user, null);
        var sha512 = crypto.createHash('sha512');
        sha512.update(user.salt + password);
        hashes.insert({
            hash: sha512.digest('hex')
        }, { w: 1 }, function (err, result) {
            if (err) {
                logger.error(err.toString());
                // resp.end(500, "Error creating user");
                return;
            }
            if (callback)
                callback(err, true);
        });
    };
    return Handler;
})();
exports.Handler = Handler;
//# sourceMappingURL=users.js.map