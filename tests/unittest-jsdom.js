var fs = require('fs'),
	assert = require('assert'),
	jsdom = require("jsdom"),
	scripts = [
		'var marky = {};',
		fs.readFileSync('../public/libjs/mootools-core-1.4.5-full-nocompat-yc.js'),
		fs.readFileSync('../public/libjs/mootools-more-1.4.0.1.js'),
		fs.readFileSync('../public/js/nav.js')
	];

describe('unit test experiment using jsdom approach', function() {
  this.timeout(60000);

	var window = null,
		mockInstance = null;

	beforeEach(function(done) {
		jsdom.env({
			html: '<html><body></body></html>',
			src: scripts,
			done: function (errors, thisWindow) {
				assert.ok(!errors, 'Should be no errors running scripts');
				window = thisWindow;
				mockInstance = {
					element: new window.Element('div', {
						'class': 'nav'
					})
				};
				done();
			}
		});
	});

	it('basic script artifacts exist', function() {
		assert.ok(window.marky.nav);
		assert.ok(window.Element);
	});

	it('render() draws correct elements', function() {
		(window.marky.nav.prototype.render.bind(mockInstance))();

		assert.ok(mockInstance._elOpts);
		assert.ok(mockInstance.element.getChildren('.opts'));
		assert.ok(mockInstance._elUpload);
		assert.ok(mockInstance.element.getChildren('.upload'));
		assert.ok(mockInstance.element.getElement('.upload > input[type=file]'));
	});

	it('_toggleSettings() toggles on', function() {
		var mockTarget = new window.Element('img', {});

		var mockFolder = new window.Element('li', {
			'class': 'folder blue',
			'data-id': '123123'
		}).adopt(
			new window.Element('button', {
				'class': 'setting'
			}).grab(mockTarget),
			new window.Element('div', {
				'class': 'settings'
			})
		);

		var mockEvent = {
			target: mockTarget
		};

		(window.marky.nav.prototype._toggleSettings.bind(mockInstance))(mockEvent);

		assert.ok(mockFolder.getElement('.setting').hasClass('active'));
		assert.ok(mockFolder.getElement('.settings').hasClass('shown'));
	});

	it('_toggleSettings() toggles off', function() {
		var mockTarget = new window.Element('img', {});

		var mockFolder = new window.Element('li', {
			'class': 'folder blue',
			'data-id': '123123'
		}).adopt(
			new window.Element('button', {
				'class': 'setting active'
			}).grab(mockTarget),
			new window.Element('div', {
				'class': 'settings shown'
			})
		);

		var mockEvent = {
			target: mockTarget
		};

		(window.marky.nav.prototype._toggleSettings.bind(mockInstance))(mockEvent);

		assert.ok(!mockFolder.getElement('.setting').hasClass('active'));
		assert.ok(!mockFolder.getElement('.settings').hasClass('shown'));
	});

	it('_addItem() adds element', function(done) {
		mockInstance._elTree = new window.Element('ul', {
			'class': 'tree'
		});
		mockInstance.options = {
			defaultName: 'Default name!'
		};
		mockInstance._db = {
			addNote: function(name, stuff, callback) {
				callback({
					_id: 'testid'
				});

				assert.ok(mockInstance._elTree.getElement('li[data-id="testid"]'), 'New element has been added');
				assert.equal(mockInstance._elTree.getElement('li[data-id="testid"]').get('text'), 'Default name!', 'New element has correct text');

				done();
			}
		};

		(window.marky.nav.prototype._addItem.bind(mockInstance))();
	});
});