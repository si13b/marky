marky.nav = new Class({
	Implements: [Options, Events],

	Binds: [
		'render'
	],

	options: {
	},
	
	element: null,
	_elList: null,
	_elOpts: null,
	_db: null,

	initialize: function(options, db) {
		this.setOptions(options);
		
		this._db = db;
		this.element = $$('.nav');
		
		this._db.retrieve(this.render)
	},
	
	render: function(root) {
		this._elOpts = new Element('div', {
			'class': 'opts'
		}).adopt(
			new Element('div', {
				'html': '+',
				'title': 'New'
			}),
			new Element('div', {
				'html': '❐',
				'title': 'Folder'
			}),
			new Element('div', {
				'html': '⧎',
				'title': 'Rename'
			}),
			new Element('div', {
				'html': '✕',
				'title': 'Delete'
			})
		);
		
		this._elList = new Element('ul', {
			
		}).adopt(
			new Element('li', {text: 'Test 1'}),
			new Element('li', {'class': 'folder', text: 'Test 2'}),
			new Element('li', {text: 'Test 3'}),
			new Element('li', {text: 'Test 4'})
		);
		
		this.element.adopt(this._elOpts, this._elList);
	}

});
