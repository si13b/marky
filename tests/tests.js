

module.exports = {
	'Pre-test': function(client) {
		client
			.url('http://localhost:3000');
	},

	'Marky login test': function(client) {
		client
			.waitForElementVisible('input[name="username"]', 1000)
			.assert.title('marky')
			.assert.visible('input[name="username"]')
			.assert.visible('input[name="password"]')
			.assert.visible('button[type="submit"]')
			.setValue('input[name="username"]', 'admin')
			.setValue('input[name="password"]', 'admin')
			.click('button[type="submit"]')
			.pause(1000)
			.assert.containsText('.blank', 'Create or select a note to get started')
			.assert.elementPresent('ul.tree.shown')
			.assert.elementNotPresent('ul.tree.shown > li', 'The tree should be initially empty')
			;
	},

	'Creating a note': function(client) {
		client
			.click('button[title="New note"]')
			.waitForElementVisible('ul.tree.shown > li', 1000)
			.assert.containsText('ul.tree.shown > li', 'New note')
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
			.setValue('ul.tree.shown > li.folder.expanded > .settings > .name > input[type="text"]', 'A folder for testing')
			.click('ul.tree.shown > li.folder.expanded > .settings > .colours > .colour.green')
			.assert.elementPresent('ul.tree.shown > li.folder.expanded.green')
			.assert.containsText('ul.tree.shown > li.folder.expanded.green > .meta > .alpha', 'A folder for testing')
			.click('ul.tree.shown > li.folder.expanded > .meta > .beta > .setting.active')
			.waitForElementNotPresent('ul.tree.shown > li.folder.expanded > .meta > .beta > .setting.active', 1000)
		;
	},

	'Move a note to a folder': function(client) {

	},

	'Logout': function(client) {
		client
			.click('.actions > a[title="Logout"]')
			.waitForElementVisible('input[name="username"]', 1000)
			.assert.title('marky')
			.assert.visible('input[name="username"]')
			.assert.visible('input[name="password"]')
			.assert.visible('button[type="submit"]')
			.end();
	}
};