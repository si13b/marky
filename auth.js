var util = require('./util');

var https = require('https'),
	querystring = require('querystring');

var Auth = new util.Class();

Auth.defaultOptions({
});

Auth.field('_db', null);

Auth.method('setDataAccess', function(newDataAccess) {
	this._dataAccess = newDataAccess;
});

Auth.method('checkError', function(req, res, err, object) {
	if (!err && object) return false;
	console.error(err);
	
	if (req.method === 'GET') res.redirect('index.html');
	else res.send(401, JSON.stringify({
		error: err
	}));
	
	return true;
});

Auth.method('signup', function(req, res) {
	var signupError = function(message) {
		// TODO Get error message to user somehow
		console.error(message);
		
		res.redirect('signup.html');
	}.bind(this);
	
	this._dataAccess.getUser(req.body.username, function(err, user) {
		console.dir(user);
		
		if (!err && user) { // Existing user shouldn't exist
			signupError('Username taken');
			return;
		}

		if ((req.body.password != req.body.confirm) || !req.body.email || !req.body.name) {
			signupError('Not all information was provided');
			return;
		}
		
		// TODO Catchpta + throttling?
		
		this._dataAccess.updateUser(req.body.username, req.body.email, req.body.name, req.body.password, onCreateUser);
	}.bind(this));
	
	var onCreateUser = function(err, result) {
		if (err || !result) {
			signupError();
			return;
		}
		
		console.log('Account created');
		res.redirect('index.html'); // TODO Get rid of these manual redirections
	}.bind(this);
});

Auth.method('check', function(req, res, next) {
	console.dir(req.body);
	console.dir(req.session);
	if (!req.session.password && req.body.password && req.body.username) {
		this._dataAccess.checkUser(req.body.username, req.body.password, function(err, result) {
			if (this.checkError(req, res, err, result)) return;
			
			req.session.username = req.body.username;
			req.session.password = req.body.password;
			
			next();
		}.bind(this));
		
	} else if (req.session.username && req.session.password) {
		console.log('Existing user/pass found');
		
		this._dataAccess.checkUser(req.session.username, req.session.password, function(err, result) {
			if (this.checkError(req, res, err, result)) return;
			
			next();
		}.bind(this));
	} else {
		this.checkError(req, res, new Error('User/pass not specified, redirecting to home'), null);
	}
});

Auth.method('requestToken', function(tempCode, callback) {
	// OLD Github authentication
	var data = querystring.stringify({
		client_id: this.options.client_id,
		client_secret: this.options.client_secret,
		code: tempCode
	});
	
	// An object of options to indicate where to post to
	var options = {
		host: 'github.com',
		port: '443',
		path: '/login/oauth/access_token',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		}
	};
	
	// Set up the request
	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('Response: ' + chunk);
			
			if (!chunk || !chunk.length) {
				callback(new Error("Empty data"), null);
				return;
			}
			
			callback(null, querystring.parse(chunk));
		});
		req.on('error', function(e) {
			callback(e, null);
		});
	});
	
	// post the data
	req.write(data);
	req.end();
});

Auth.method('user', function(token, callback) {
	var data = querystring.stringify({
		access_token: token
	});
	
	// An object of options to indicate where to post to
	var options = {
		host: 'api.github.com',
		port: '443',
		path: '/user?' + data,
		method: 'GET'
	};
	
	// Set up the request
	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			if (!chunk || !chunk.length) {
				callback(new Error('Empty data'), null);
				return;
			}
			
			console.dir(chunk);
			
			callback(null, JSON.parse(chunk));
		});
	});
	
	req.end();
	
	req.on('error', function(e) {
		callback(e, null);
	});
});

Auth.method('logout', function(req, res) {
	if (req.session.password) req.session.password = null;
	if (req.session.username) req.session.username = null;
	if (req.method === 'GET') res.redirect('index.html');
	else res.send(301, 'index.html');
});

exports.Auth = Auth;