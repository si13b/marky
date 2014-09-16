exports.command = function(title) {
	this
		.useXpath()
		.waitForElementVisible('//ul[contains(@class, "tree") and contains(@class, "shown")]/li[contains(text(), "' + title + '")]', 1000)
		.click('//ul[contains(@class, "tree") and contains(@class, "shown")]/li[contains(text(), "' + title + '")]')
		.useCss()
		.waitForElementVisible('#aceeditor', 1000)
		.waitForElementVisible('.title > input[type="text"]', 1000)
	;

	return this;
};