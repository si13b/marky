///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/mongodb/mongodb.d.ts' />
///<reference path='../typings/body-parser/body-parser.d.ts' />
///<reference path='../typings/cookie-parser/cookie-parser.d.ts' />
///<reference path='../typings/express-session/express-session.d.ts' />
///<reference path='../typings/log4js/log4js.d.ts' />

import MongoDB = require('mongodb');
import log4js = require('log4js');
import Users = require('./users');

var crypto = require('crypto'),
	Zip = require('node-zip'),
	logger = log4js.getLogger(),
	https = require('https'),
	querystring = require('querystring');

/**
 * Handle authentication
 */
export class Handler {
	private _userModule: Users.Handler;

	constructor(userModule: Users.Handler) {
		this._userModule = userModule;
	}

	checkError(req, res, err: Error, object) {
		if (!err && object) return false;
		logger.error(err.toString());

		if (req.method === 'GET') res.redirect('index.html');
		else res.send(401, JSON.stringify({
			unauthenticated: true
		}));

		return true;
	}

	/**
	 * Create a new user in the database.
	 * @param req
	 * @param res
	 */
	signup(req, res) {
		var signupError = function(message: string) {
			// TODO Get error message to user somehow
			logger.error(message);

			res.redirect('signup.html');
		}.bind(this);

		this._userModule.getUser(req.body.username, function(err: Error, user: Users.User) {
			if (!err && user) { // Existing user shouldn't exist
				signupError('Username taken');
				return;
			}

			if ((req.body.password != req.body.confirm) || !req.body.email || !req.body.name) {
				signupError('Not all information was provided');
				return;
			}

			// TODO Catchpta + throttling?

			this._userModule.updateUser(req.body.username, req.body.email, req.body.name, req.body.password, onCreateUser);
		}.bind(this));

		var onCreateUser = function (err: Error, result: boolean) {
			if (err || !result) {
				signupError();
				return;
			}

			logger.info('Account created');
			res.redirect('index.html'); // TODO Get rid of these manual redirections
		}.bind(this);
	}

	/**
	 * Authenticate user and initiate session if necessary.
	 *
	 * Credentials must be in the request or in the session, otherwise the user
	 * is redirected to the login page.
	 */
	check(req, res, next: Function) {
		if (!req.session.password && req.body.password && req.body.username) {
			// Attempt to start new session using requested user/pass
			this._userModule.checkUser(req.body.username, req.body.password, function(err: Error, result) {
				if (this.checkError(req, res, err, result)) return;


				req.session.username = req.body.username;
				req.session.password = req.body.password;

				next();
			}.bind(this));

		} else if (req.session.username && req.session.password) {
			// Continuing an existing session with stored user/pass
			this._userModule.checkUser(req.session.username, req.session.password, function (err: Error, result) {
				if (this.checkError(req, res, err, result)) return;

				next();
			}.bind(this));
		} else {
			// No user/pass in request or session! Redirect to login.
			this.checkError(req, res, new Error('User/pass not specified, redirecting to home'), null);
		}
	}

	/**
	 * Terminate the use session
	 *
	 * @param req
	 * @param res
	 */
	logout(req, res) {
		if (req.session.password) req.session.password = null;
		if (req.session.username) req.session.username = null;
		if (req.method === 'GET') res.redirect('index.html');
		else res.send(401, JSON.stringify({
			unauthenticated: true
		}));
	}
}
