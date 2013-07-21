marky.nav = new Class({
	Implements: [Options, Events],

	Binds: [
		'render',
		'_renderItem',
		'_toggleSettings',
		'_renderSettings',
		'_addItem',
		'_download',
		'_clickItem',
		'_addFolder',
		'_deleteItem',
		'_moveItem',
		'_changeName',
		'_changeColour',
		'_onChangeName',
		'_showSettings'
	],

	options: {
		defaultName: 'New note',
		defaultFolderName: 'New folder',
		colours: ['gray', 'yellow', 'green', 'orange', 'blue', 'purple', 'red']
	},
	
	element: null,
	_elList: null,
	_elOpts: null,
	_db: null,
	_content: null,

	initialize: function(options, content, db) {
		this.setOptions(options);
		
		this._content = content;
		this._content.addEvent('changeName', this._onChangeName);
		this._content.addEvent('delete', this._deleteItem);
		this._content.addEvent('move', this._moveItem);
		
		this._db = db;
		this.element = $$('nav');
		
		this._db.getTree(this.render)
	},
	
	render: function(tree) {
		this._elOpts = new Element('div', {
			'class': 'opts'
		}).adopt(
			new Element('div', {
				'title': 'New note',
				'events': {
					'click': this._addItem
				}
			}).grab(new Element('i', {'class': 'foundicon-page'})),
			new Element('div', {
				'title': 'New folder',
				'events': {
					'click': this._addFolder
				}
			}).grab(new Element('i', {'class': 'foundicon-folder'})),
			new Element('div', {
				'title': 'Download data',
				'events': {
					'click': this._download
				}
			}).grab(new Element('i', {'class': 'foundicon-inbox'}))
		);
		
		this._elList = new Element('ul', {
			'events': {
				'click:relay(li)': this._clickItem
			}
		});
		
		Object.each(tree, function(item, key) {
			this._renderItem(item, key, this._elList);
		}.bind(this));
		
		this.element.adopt(this._elOpts, this._elList);
	},
	
	_renderItem: function(item, key, elParent) {
		var elItem = null;
			
		if (item.folder) {
			elItem = new Element('li', {
				'class': 'folder ' + item.colour,
				'data-id': key
			}).adopt(
				new Element('i', {'class': 'foundicon-folder'}),
				new Element('span', {
					'html': item.name
				})
			);
			
			var elSetting = new Element('div', {
				'class': 'setting',
				'events': {
					'click': this._toggleSettings
				}
			}).grab(new Element('i', {'class': 'foundicon-settings'}));
			
			var elTree = new Element('ul', {
			});
			
			Object.each(item.items, function(subItem, subKey) {
				this._renderItem(subItem, subKey, elTree);
			}.bind(this));
			
			elItem.adopt(elSetting, this._renderSettings(item), elTree);
		} else {
			elItem = new Element('li', {
				'html': item.name,
				'data-id': key
			});
		}
		
		elParent.grab(elItem);
	},
	
	_toggleSettings: function(event) {
		var element = $(event.target);
		
		if (!element.hasClass('setting')) element = element.getParent('.setting');

		var elFolder = element.getParent('.folder');
		var elSettings = elFolder.getChildren('.settings');
		
		element.toggleClass('active');
		elSettings.toggleClass('shown');
	},
	
	_renderSettings: function(item) {
		var elSettings = new Element('div', {
			'class': 'settings'
		});
		
		var elName = new Element('div', {
			'class': 'name'
		}).grab(new Element('label', {
			'html': 'Name:'
		}));
		
		var elNameT = new Element('input', {
			'type': 'text',
			'value': item.name,
			'events': {
				'change': this._changeName
			}
		});
		
		elName.grab(elNameT);
		
		var elColours = new Element('div', {
			'class': 'colours',
			'events': {
				'click:relay(.colour)': this._changeColour
			}
		});
		
		this.options.colours.each(function(item, index) {
			elColours.grab(
				new Element('div', {
					'class': 'colour ' + item,
					'data-colour': item
				})
			)
		}.bind(this));
		
		elSettings.adopt(
			elName,
			elColours
		);
		
		return elSettings;
	},
	
	_download: function() {
		this._db.dump(function(content) {
			var url = 'data:text/plain,' + encodeURI(JSON.encode(content));
			new marky.msg({
				timeout: 10000,
				buttons: ['close']
			}).show('<a href="' + url + '">Click here to download content</a>');
		});
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
		
		if (element.hasClass('setting') || element.getParent('.setting') || element.getParent('.settings')) return;
		
		if (element.get('tag') !== 'li') element = element.getParent('li');
		
		if (element.hasClass('folder')) {
			element.toggleClass('expanded');
		} else {
			var elExisting = this.element.getElement('.selected');
			if (elExisting && elExisting.removeClass) elExisting.removeClass('selected');
			
			this._content.setSelected(element.get('data-id'));
			
			element.addClass('selected');
		}
	},
	
	_addFolder: function(event) {
		this._db.addFolder(this.options.defaultFolderName, null, function(newID) {
			this._elList.grab(
				new Element('li', {
					'class': 'folder',
					'data-id': newID
				}).adopt(
					new Element('i', {'class': 'foundicon-folder'}),
					new Element('span', {
						'html': this.options.defaultFolderName
					}),
					new Element('ul', {
					})
				)
			)
		}.bind(this));
	},
	
	_deleteItem: function(item) {
		if (!item) return;
		
		var el = this._elList.getElement('li[data-id="' + item + '"]');
		if (el) el.destroy();
	},
	
	_moveItem: function(item, moveTo) {
		if (!item) return;
		
		var elMovee = this._elList.getElement('li[data-id="' + item + '"]');
		var elMoved = this._elList.getElement('li[data-id="' + moveTo + '"] ul');
		if (!elMoved) elMoved = this._elList;
		elMovee.inject(elMoved);
	},
	
	_changeName: function(event) {
		var element = $(event.target);
		var title = element.get('value');
		
		var elFolder = element.getParent('.folder');
		var folder = elFolder.get('data-id');
		
		this._db.saveName(folder, title, function() {
			elFolder.getElement('span').set('html', title);
		}.bind(this));
	},
	
	_changeColour: function(event) {
		var element = $(event.target);
		var colour = element.get('data-colour');
		var elFolder = element.getParent('.folder');
		var folder = elFolder.get('data-id');
		
		this._db.saveColour(folder, colour, function() {
			this.options.colours.each(function(item, index) {
				elFolder.removeClass(item);
			}.bind(this))
			
			elFolder.addClass(colour);
		}.bind(this));
	},
	
	_onChangeName: function(id, name) {
		var el = this._elList.getElement('li[data-id="' + id + '"]');
		el.set('html', name);
	}

});
