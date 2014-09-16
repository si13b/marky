var Util = require('./util'),
	https = require('https'),
	querystring = require('querystring'),
	log4js = require('log4js'),
	logger = log4js.getLogger();

var Auth = Util.Class({
	init: function(userModule) {
		this._userModule = userModule;
	},

	checkError: function (req, res, err, object) {
		if (!err && object) return false;
		logger.error(err);

		if (req.method === 'GET') res.redirect('index.html');
		else res.send(401, JSON.stringify({
			unauthenticated: true
		}));

		return true;
	},

	signup: function (req, res) {
		var signupError = function (message) {
			// TODO Get error message to user somehow
			logger.error(message);

			res.redirect('signup.html');
		}.bind(this);

		this._userModule.getUser(req.body.username, function (err, user) {
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

		var onCreateUser = function (err, result) {
			if (err || !result) {
				signupError();
				return;
			}

			logger.info('Account created');
			res.redirect('index.html'); // TODO Get rid of these manual redirections
		}.bind(this);
	},

	/**
	 * Authenticate user and initiate session if necessary.
	 *
	 * Credentials must be in the request or in the session, otherwise the user
	 * is redirected to the login page.
	 */
	check: function (req, res, next) {
		if (!req.session.password && req.body.password && req.body.username) {
			// Attempt to start new session using requested user/pass
			this._userModule.checkUser(req.body.username, req.body.password, function (err, result) {
				if (this.checkError(req, res, err, result)) return;

				req.session.username = req.body.username;
				req.session.password = req.body.password;

				next();
			}.bind(this));

		} else if (req.session.username && req.session.password) {
			// Continuing an existing session with stored user/pass
			this._userModule.checkUser(req.session.username, req.session.password, function (err, result) {
				if (this.checkError(req, res, err, result)) return;

				next();
			}.bind(this));
		} else {
			// No user/pass in request or session! Redirect to login.
			this.checkError(req, res, new Error('User/pass not specified, redirecting to home'), null);
		}
	},

	logout: function (req, res) {
		if (req.session.password) req.session.password = null;
		if (req.session.username) req.session.username = null;
		if (req.method === 'GET') res.redirect('index.html');
		else res.send(401, JSON.stringify({
			unauthenticated: true
		}));
	}
});

module.exports = Auth;