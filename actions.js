var test = function(req, res) {
	res.json({text: "Hello world with mootools!"});
}

var save = function(req, res) {
	res.json({text: "Saved!"});
}

module.exports = {
	test: test,
	save: save
}