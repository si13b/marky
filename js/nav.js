marky.nav = new Class({
	Implements: [Options, Events],

	Binds: [
		'render',
		'_addItem'
	],

	options: {
		defaultName: 'New note'
	},
	
	element: null,
	_elList: null,
	_elOpts: null,
	_db: null,

	initialize: function(options, db) {
		this.setOptions(options);
		
		this._db = db;
		this.element = $$('.nav');
		
		this._db.getTree(this.render)
	},
	
	render: function(tree) {
		this._elOpts = new Element('div', {
			'class': 'opts'
		}).adopt(
			new Element('div', {
				'html': '+',
				'title': 'New',
				'events': {
					'click': this._addItem
				}
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
			
		});
		
		Object.each(tree, function(item, key) {
			new Element('li', {
				'class': (item.items ? 'folder' : undefined),
				text: item.name,
				'data-id': key
			});
			
			// TODO render child elements
		}.bind(this));
		
		this.element.adopt(this._elOpts, this._elList);
	},
	
	_addItem: function() {
		// TODO get parent ID of context
		
		this._db.addNote(this.options.defaultName, null, function(newID) {
			this._elList.adopt(
				new Element('li', {
					text: this.options.defaultName,
					'data-id': newID
				})
			)
		}).bind(this);
	}

});
