exports.command = function(username, password) {
	this
		.waitForElementVisible('input[name="username"]', 1000)
		.assert.title('marky')
		.assert.visible('input[name="username"]')
		.assert.visible('input[name="password"]')
		.assert.visible('button[type="submit"]')
		.setValue('input[name="username"]', username)
		.setValue('input[name="password"]', password)
		.click('button[type="submit"]')
		.waitForElementVisible('.blank', 1000)
		.pause(500);

	return this;
};