var util = require('./util');

var https = require('https'),
	querystring = require('querystring');

// See docs @ http://mongodb.github.io/node-mongodb-native/

var Auth = new util.Class();

Auth.defaultOptions({
	client_id: '123',
	client_secret: '456'
});

Auth.field('_db', null);
Auth.field('_url', null);

Auth.method('setURL', function(newURL) {
	this._url = newURL;
});

Auth.method('setDataAccess', function(newDataAccess) {
	this._dataAccess = newDataAccess;
});

Auth.method('check', function(req, res, next) {
	if (!req.session.token && req.query.code) {
		console.log('Retrieving token for temp code: ' + req.query.code);
		
		this.requestToken(req.query.code, function (err, response) {
			if (err) {
				console.error('Error has occured: ' + err);
				if (err.request && err.request.uri) console.error('href: ' + err.request.uri.href);
				
				if (req.method === 'GET') res.redirect('index.html');
				else res.send(301, 'index.html');
				return;
			}
			
			var token = response.access_token;
			
			if (!token) {
				console.error('Token was not provided?!');
				
				if (req.method === 'GET') res.redirect('index.html');
				else res.send(301, 'index.html');
				return;
			}
			
			console.log('Token recevied');
			
			if (!req.session.token) req.session.token = token;
			
			this.user(req.session.token, function(err, response) {
				if (err || !response.login) {
					console.error(err);
					
					if (req.method === 'GET') res.redirect('index.html');
					else res.send(301, 'index.html');
					return;
				}
				
				console.log('User: ' + response.login);
				
				req.session.username = response.login;
				
				this._dataAccess.updateUser(response, token, function(err, result) {
					if (err || !result) {
						console.error(err);
			
						if (req.method === 'GET') res.redirect('index.html');
						else res.send(301, 'index.html');
						return;
					}
					
					next();
				});
			}.bind(this));
		}.bind(this));
	} else if (req.session.token) {
		console.log('Existing token found');
		
		this._dataAccess.checkUser(req.session.username, req.session.token, function(err, result) {
			if (err || !result) {
				console.error(err);
	
				if (req.method === 'GET') res.redirect('index.html');
				else res.send(301, 'index.html');
				return;
			}
			
			next();
		});
	} else {
		console.log('redirecting to github login');
		if (req.method === 'GET') res.redirect(this._url);
		else res.send(301, this._url);
	}
});

Auth.method('requestToken', function(tempCode, callback) {
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
			
			callback(null, JSON.parse(chunk));
		});
	});
	
	req.end();
	
	req.on('error', function(e) {
		callback(e, null);
	});
});

Auth.method('logout', function(req, res) {
	this._dataAccess.clearUser(req.session.username, function(err, result) {
		if (err || !result) {
			log.error(err);
			
			if (req.method === 'GET') res.redirect('index.html');
			else res.send(301, 'index.html');
			return;
		}
		
		if (req.session.token) req.session.token = null;
		if (req.session.username) req.session.username = null;
		if (req.method === 'GET') res.redirect('index.html');
		else res.send(301, 'index.html');
	});
});

exports.Auth = Auth;