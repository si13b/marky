marky.nav = new Class({
	Implements: [Options, Events],

	Binds: [
		'render',
		'_renderItem',
		'_toggleSettings',
		'_renderSettings',
		'_addItem',
		'_download',
		'_upload',
		'_clickItem',
		'_addFolder',
		'_deleteItem',
		'_deleteFolder',
		'_moveItem',
		'_changeName',
		'_changeColour',
		'_onChangeName',
		'_toggleArchive',
		'_toggleUpload'
	],

	options: {
		defaultName: 'New note',
		defaultFolderName: 'New folder',
		colours: ['gray', 'yellow', 'green', 'orange', 'blue', 'purple', 'red']
	},
	
	element: null,
	_elList: null,
	_elArchiveList: null,
	_elOpts: null,
	_elUpload: null,
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
			}).grab(new Element('i', {'class': 'foundicon-inbox'})),
			new Element('div', {
				'title': 'Import data',
				'events': {
					'click': this._toggleUpload
				}
			}).grab(new Element('i', {'class': 'foundicon-up-arrow'}))
		);
		
		this._elUpload = new Element('div', {
			'class': 'upload'
		});
		
		var elFile = new Element('input', {
			'type': 'file',
			'events': {
				'change': this._upload
			}
		});
		
		this._elUpload.grab(elFile);
		
		this._elList = new Element('ul', {
			'events': {
				'click:relay(li)': this._clickItem
			}
		});
		
		Object.each(tree, function(item, key) {
			this._renderItem(item, key, this._elList);
		}.bind(this));
		
		this.element.adopt(this._elOpts, this._elUpload, this._elList);
	},
	
	_renderItem: function(item, key, elParent) {
		var elItem = null;
			
		if (item.folder) {
			elItem = new Element('li', {
				'class': 'folder ' + item.colour,
				'data-id': key
			});
			
			var elAlpha = new Element('div', {
				'class': 'alpha'
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
			
			var elBeta = new Element('div', {
				'class': 'beta'
			}).grab(elSetting);
			
			var elMeta = new Element('div', {
				'class': 'meta'
			}).adopt(elAlpha, elBeta);
			
			var elTree = new Element('ul', {
			});
			
			Object.each(item.items, function(subItem, subKey) {
				this._renderItem(subItem, subKey, elTree);
			}.bind(this));
			
			elItem.adopt(elMeta, this._renderSettings(item), elTree);
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
		
		var elDelete = new Element('button', {
			'title': 'Delete',
			'text': 'Delete',
			'events': {
				'click': this._deleteFolder
			}
		});
		
		elSettings.adopt(
			elName,
			elColours,
			elDelete
		);
		
		return elSettings;
	},
	
	_download: function() {
		this._db.dump(function(content) {
			var blob = new Blob([JSON.encode(content)], {type: "text/plain"}); // pass a useful mime type here
			var url = URL.createObjectURL(blob);
			//var url = 'data:text/plain,' + encodeURI(JSON.encode(content));
			new marky.msg({
				timeout: 10000,
				buttons: ['close']
			}).show('<a href="' + url + '" download>Click here to download content</a>');
		});
	},
	
	_upload: function(event) {
		var element = $(event.target);
		
		if (!element.files || !element.files.length) return;
		
		for (var i = 0; i < element.files.length; i++) {
			var reader = new FileReader();
		
			reader.onload = function(fileEvent) {
				var obj = JSON.decode(fileEvent.target.result);
				if (!obj) return;
				this._db.load(obj);
			}.bind(this);
		
			reader.readAsText(element.files[i]);
		}
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
			var o = {
				folder: true,
				name: this.options.defaultFolderName,
				items: []
			};
			
			this._renderItem(o, newID, this._elList);
		}.bind(this));
	},
	
	_deleteItem: function(item) {
		if (!item) return;
		
		var el = this._elList.getElement('li[data-id="' + item + '"]');
		if (el) el.destroy();
	},
	
	_deleteFolder: function(item) {
		// TODO call db
		// TODO Remove all child objects from folder
		// TODO Remove folder display object itself
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
	},
	
	_toggleArchive: function(event) {
		var element = $(event.target);
		
		// Ensure this is the element we want, and not a child capturing the event
		if (!element.hasClass('archive')) element = element.getParent('.archive');
		
		element.toggleClass('open');
	},
	
	_toggleUpload: function(event) {
		var element = $(event.target);
		
		// Ensure this is the element we want, and not a child capturing the event
		if (element.get('tag') !== 'div') element = element.getParent('div');
		
		element.toggleClass('open');
		this._elUpload.toggleClass('open');
	}

});
