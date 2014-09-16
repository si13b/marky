exports.command = function() {
	this
		.click('.actions > a[title="Logout"]')
		.waitForElementVisible('input[name="username"]', 1000)
		.assert.title('marky')
		.assert.visible('input[name="username"]')
		.assert.visible('input[name="password"]')
		.assert.visible('button[type="submit"]')
		.pause(500);

	return this;
};