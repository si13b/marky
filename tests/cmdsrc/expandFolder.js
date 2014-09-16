exports.command = function(title) {
	this
		.useXpath()
		.waitForElementVisible('//ul[contains(@class, "tree") and contains(@class, "shown")]/li[contains(@class, "folder") and contains(text(), "' + title + '")]', 1000)
		.click('//ul[contains(@class, "tree") and contains(@class, "shown")]/li[contains(@class, "folder") and contains(text(), "' + title + '")]')
		.waitForElementVisible('//ul[contains(@class, "tree") and contains(@class, "shown")]/li[contains(@class, "folder") and contains(@class, "expanded") and contains(text(), "' + title + '")]', 1000)
		.useCss()
	;

	return this;
};