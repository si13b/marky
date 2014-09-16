var Db = require('mongodb').Db,
	Server = require('mongodb').Server;

module.exports = {
	before: function (browser, callback) {
		var db = new Db('marky', new Server('localhost', 27017), {safe: false});

		db.open(function (err, newDB) {
			if (!err) {
				console.log("Connected to mongo!");
			} else {
				console.error(err);
			}

			db.command({dropDatabase: 1}, {}, function (err) {
				if (err) {
					console.error('Could not drop current database');
					return;
				}
				db.admin().command({copydb: 1, fromdb: 'marky-template', todb: 'marky'}, {}, function (err) {
					if (err) {
						console.error('Could not copy the template database');
						return;
					}

					db.close();
					callback();
				});
			});
		}.bind(this));
	}
}