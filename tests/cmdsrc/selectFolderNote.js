/**
 * Expects that the folder is already expanded
 *
 * @param folderTitle
 * @param noteTitle
 */
exports.command = function(folderTitle, noteTitle) {
	this
		.useXpath()
		.waitForElementVisible('//ul[contains(@class, "tree") and contains(@class, "shown")]/li[contains(@class, "folder") and contains(@class, "expanded") and contains(text(), "' + folderTitle + '")]/ul/li[@data-id and contains(@text, "' + noteTitle + '")]', 1000)
		.click('//ul[contains(@class, "tree") and contains(@class, "shown")]/li[contains(@class, "folder") and contains(@class, "expanded") and contains(text(), "' + folderTitle + '")]/ul/li[@data-id and contains(@text, "' + noteTitle + '")]')
		.useCss()
		.pause(100)
		.waitForElementVisible('#aceeditor', 1000)
		.waitForElementVisible('.title > input[type="text"]', 1000)
		.assert.value('.title > input[type="text"]', noteTitle)
	;

	return this;
};