marky.nav = new Class({
	Implements: [Options, Events],

	Binds: [
		'render',
		'_addItem',
		'_clickItem',
		'_addFolder',
		'_deleteItem',
		'_changeName'
	],

	options: {
		defaultName: 'New note'
	},
	
	element: null,
	_elList: null,
	_elOpts: null,
	_db: null,
	_content: null,

	initialize: function(options, content, db) {
		this.setOptions(options);
		
		this._content = content;
		this._content.addEvent('changeName', this._changeName);
		
		this._db = db;
		this.element = $$('nav');
		
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
				'title': 'Folder',
				'events': {
					'click': this._addFolder
				}
			})
		);
		
		this._elList = new Element('ul', {
			'events': {
				'click:relay(li)': this._clickItem
			}
		});
		
		Object.each(tree, function(item, key) {
			this._elList.grab(new Element('li', {
				'class': (item.items ? 'folder' : undefined),
				text: item.name,
				'data-id': key
			}));
			
			// TODO render child elements
		}.bind(this));
		
		this.element.adopt(this._elOpts, this._elList);
	},
	
	_addItem: function() {
		// TODO get parent ID of context
		
		this._db.addNote(this.options.defaultName, null, function(newID) {
			this._elList.grab(
				new Element('li', {
					text: this.options.defaultName,
					'data-id': newID
				})
			)
		}.bind(this));
	},
	
	_clickItem: function(event) {
		var element = $(event.target);
		
		var elExisting = this.element.getElement('.selected');
		if (elExisting && elExisting.removeClass) elExisting.removeClass('selected');
		
		this._content.setSelected(element.get('data-id'));
		
		element.addClass('selected');
	},
	
	_addFolder: function(event) {
		
	},
	
	_deleteItem: function(event) {
		var selected = this._content.getSelected();
		
		if (!selected) return;
		
		this._db.deleteNote(selected, function(newID) {
			var el = this._elList.getElement('li[data-id="' + selected + '"]');
			if (el) el.destroy();
		}.bind(this));
	},
	
	_changeName: function(id, name) {
		var el = this._elList.getElement('li[data-id="' + id + '"]');
		el.set('html', name);
	}

});
