var fs = require('fs'),
	assert = require('assert'),
	Mocktools = require('./mocktools'),
	Class = Mocktools.Class,
	Element = Mocktools.Element,
	Options = Mocktools.Options,
	Events = Mocktools.Events,
	$ = Mocktools.Moo;

Mocktools.Arrayerizer(Array.prototype);

var script = fs.readFileSync('../public/js/nav.js');
eval('var marky = {};\n' + script); // Execute front-end script

describe('a suite of tests', function() {
  this.timeout(500);
	
  it('Retrieve artefacts', function() {
		assert.notEqual(script, '', 'Script is not empty');
		assert.notEqual(script, null, 'Script is not null');
		assert.ok(script && script.length, 'Script is truthy');
		assert.ok(!!marky, 'Marky object found');
    assert.ok(marky.nav, 'Nav object should be found');
  });
	
	it('render() tests', function() {
		var mock = {
			element: new Element('div', {}),
			__renderItemCount: 0,
			_renderItem: function() {
				this.__renderItemCount++;
			} 
		};
		
		marky.nav.render.bind(mock)(['item1', 'item2']);
		//console.dir(mock.element);
		
		assert.equal(mock.__renderItemCount, 2);
		assert.equal(mock.element.children.length, 6);
		assert.equal(mock.element.children[0].type, 'div');
		assert.equal(mock.element.children[0].options['class'], 'opts');
		assert.equal(mock.element.children[1].type, 'div');
		assert.equal(mock.element.children[1].options['class'], 'upload');
		assert.equal(mock.element.children[1].children.length, 1);
		assert.equal(mock.element.children[2].type, 'div');
		assert.equal(mock.element.children[2].options['class'], 'search');
		assert.equal(mock.element.children[3].type, 'ul');
		assert.equal(mock.element.children[3].options['class'], 'results');
		assert.equal(mock.element.children[4].type, 'ul');
		assert.equal(mock.element.children[4].options['class'], 'tree shown');
		assert.equal(mock.element.children[5].type, 'div');
		assert.equal(mock.element.children[5].options['class'], 'actions');
		assert.equal(mock.element.children[5].children.length, 2);
		
		// Try again
		mock.__renderItemCount = 0;
		mock.element.children = []
		marky.nav.render.bind(mock)([]);
		
		assert.equal(mock.__renderItemCount, 0);
		assert.equal(mock.element.children[0].type, 'div');
		assert.equal(mock.element.children[0].options['class'], 'opts');
		assert.equal(mock.element.children[1].type, 'div');
		assert.equal(mock.element.children[1].options['class'], 'upload');
		assert.equal(mock.element.children[1].children.length, 1);
		assert.equal(mock.element.children[2].type, 'div');
		assert.equal(mock.element.children[2].options['class'], 'search');
		assert.equal(mock.element.children[3].type, 'ul');
		assert.equal(mock.element.children[3].options['class'], 'results');
		assert.equal(mock.element.children[4].type, 'ul');
		assert.equal(mock.element.children[4].options['class'], 'tree shown');
		assert.equal(mock.element.children[5].type, 'div');
		assert.equal(mock.element.children[5].options['class'], 'actions');
		assert.equal(mock.element.children[5].children.length, 2);
	});
	
	it('_toggleSettings() tests', function() {
		var mock = {
		};
		
		var elTarget = new Element('div', {
			'class': 'setting'
		});
		var elFolder = new Element('div', {
			'class': 'folder'
		});
		var elSettings = new Element('div', {
			'class': 'settings'
		});
		elTarget.__addGetParentMock(elFolder);
		elFolder.__addGetChildrenMock(elSettings);
		
		marky.nav._toggleSettings.bind(mock)({target: elTarget});
		
		assert.ok(elSettings.hasClass('shown'));
		assert.ok(elTarget.hasClass('active'));
	});
});