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

	var window = null;

	beforeEach(function(done) {
		jsdom.env({
			html: '<html><body></body></html>',
			src: scripts,
			done: function (errors, thisWindow) {
				assert.ok(!errors, 'Should be no errors running scripts');
				window = thisWindow;
				done()
			}
		});
	});

	it('render() draws correct elements', function() {
		assert.ok(window.marky.nav);
		assert.ok(window.Element);

		var mock = {
			element: new window.Element('div', {
				'class': 'nav'
			})
		};
		(window.marky.nav.prototype.render.bind(mock))();

		assert.ok(mock._elOpts);
		assert.ok(mock.element.getChildren('.opts'));
		assert.ok(mock._elUpload);
		assert.ok(mock.element.getChildren('.upload'));
		assert.ok(mock.element.getElement('.upload > input[type=file]'));
	});

	it('_toggleSettings() toggles on', function() {
		assert.ok(window.marky.nav);
		assert.ok(window.Element);

		var mock = {
			element: new window.Element('div', {
				'class': 'nav'
			})
		};

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

		(window.marky.nav.prototype._toggleSettings.bind(mock))(mockEvent);

		assert.ok(mockFolder.getElement('.setting').hasClass('active'));
		assert.ok(mockFolder.getElement('.settings').hasClass('shown'));
	});

	it('_toggleSettings() toggles off', function() {
		assert.ok(window.marky.nav);
		assert.ok(window.Element);

		var mock = {
			element: new window.Element('div', {
				'class': 'nav'
			})
		};

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

		(window.marky.nav.prototype._toggleSettings.bind(mock))(mockEvent);

		assert.ok(!mockFolder.getElement('.setting').hasClass('active'));
		assert.ok(!mockFolder.getElement('.settings').hasClass('shown'));
	});
});