module.exports = {
	'Pre-test': function(client) {
		client
			.url('http://localhost:3000');
	},

	'Marky login test': function(client) {
		client
			.login('admin', 'admin')
			.assert.containsText('.blank', 'Create or select a note to get started')
			.assert.elementPresent('ul.tree.shown')
			.assert.elementNotPresent('ul.tree.shown > li', 'The tree should be initially empty')
			;
	},

	'Creating a note': function(client) {
		client
			.assert.elementNotPresent('ul.tree.shown > li', 'New note')
			.click('button[title="New note"]')
			.selectNote('New note')
			.click('ul.tree.shown > li')
			.waitForElementVisible('#aceeditor', 1000)
			.waitForElementVisible('.title > input[type="text"]', 1000)
			.clearValue('.title > input[type="text"]')
			.setValue('.title > input[type="text"]', 'Note used for testing')
			.click('#aceeditor textarea')
			.keys('Hello testing one two')
			.waitForElementVisible('#aceeditor .ace_scroller', 1000)
			.assert.containsText('#aceeditor .ace_scroller', 'Hello testing one two')
			.click('.toolbar button[title="Save"]')
			.assert.containsText('ul.tree.shown > li.selected', 'Note used for testing');
	},

	'Creating a folder': function(client) {
		client
			.click('button[title="New folder"]')
			.waitForElementVisible('ul.tree.shown > li.folder', 1000)
			.assert.containsText('ul.tree.shown > li.folder', 'New folder')
			.click('ul.tree.shown > li.folder')
			.assert.elementPresent('ul.tree.shown > li.folder.expanded')
			.click('ul.tree.shown > li.folder.expanded > .meta > .beta > .setting')
			.assert.elementPresent('ul.tree.shown > li.folder.expanded > .meta > .beta > .setting.active')
			.waitForElementVisible('ul.tree.shown > li.folder.expanded > .settings', 1000)
			.clearValue('ul.tree.shown > li.folder.expanded > .settings > .name > input[type="text"]')
			.pause(100)
			//.setValue('ul.tree.shown > li.folder.expanded > .settings > .name > input[type="text"]', 'A folder for testing')
			.click('ul.tree.shown > li.folder.expanded > .settings > .name > input[type="text"]')
			.keys('A folder for testing\n')
			.pause(100)
			.click('ul.tree.shown > li.folder.expanded > .settings > .colours > .colour.green')
			.assert.elementPresent('ul.tree.shown > li.folder.expanded.green')
			.assert.containsText('ul.tree.shown > li.folder.expanded.green > .meta > .alpha', 'A folder for testing')
			.click('ul.tree.shown > li.folder.expanded > .meta > .beta > .setting.active')
			.waitForElementNotPresent('ul.tree.shown > li.folder.expanded > .meta > .beta > .setting.active', 1000)
		;
	},

	'Move a note to a folder': function(client) {
		////*[contains(text(),'match')]
		//contains(@prop,'Foo')
		client
			.selectNote('Note used for testing')
			.waitForElementVisible('.toolbar > .alpha > button[title="Move to"]', 1000)
			.click('.toolbar > .alpha > button[title="Move to"]')
			.waitForElementVisible('.panel > ul > li', 1000)
			.useXpath()
			.click('//div[contains(@class, "panel")]/ul/li[@data-id and contains(text(), "A folder for testing")]')
			.useCss()
			.waitForElementNotPresent('.panel > ul > li', 1000)
		;
	},

	'Logout': function(client) {
		client
			.logout()
			.end();
	}
};