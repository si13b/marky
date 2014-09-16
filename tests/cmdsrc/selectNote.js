exports.command = function(title) {
	this
		.useXpath()
		.waitForElementVisible('//ul[contains(@class, "tree") and contains(@class, "shown")]/li[contains(text(), "' + title + '")]', 1000)
		.click('//ul[contains(@class, "tree") and contains(@class, "shown")]/li[contains(text(), "' + title + '")]')
		.useCss()
		.waitForElementVisible('#aceeditor', 1000)
		.waitForElementVisible('.title > input[type="text"]', 1000)
		// Have to use getAttribute due to bug in "pairing in some Selenium versions.
		// https://github.com/beatfactor/nightwatch/issues/193
		.getAttribute('.title > input', 'value', function(result) {
			this.assert.equal(typeof result, 'object');
			this.assert.equal(result.status, 0);
			this.assert.equal(result.value, title);
		})
		//.assert.value('.title > input', title, 'Selected note title is displayed')
	;

	return this;
};