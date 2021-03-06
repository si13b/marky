marky.nav = new Class({
	Implements: [Options, Events],

	Binds: [
		'render',
		'_renderItem',
		'_toggleSettings',
		'_renderSettings',
		'_addItem',
		'_logout',
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
		'_toggleUpload',
		'focusSearch',
		'_search'
	],

	options: {
		defaultName: 'New note',
		defaultFolderName: 'New folder',
		colours: ['gray', 'yellow', 'green', 'orange', 'blue', 'purple', 'red']
	},
	
	element: null,
	_elTree: null,
	_elSearch: null,
	_elResults: null,
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
			new Element('button', {
				'title': 'New note',
				'html': 'New note',
				'events': {
					'click': this._addItem
				}
			}).grab(new Element('i', {'class': 'foundicon-page'})),
			new Element('button', {
				'title': 'New folder',
				'html': 'New folder',
				'events': {
					'click': this._addFolder
				}
			}).grab(new Element('i', {'class': 'foundicon-folder'}))
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
		
		var elSearchC = new Element('div', {
			'class': 'search'
		}).grab(
			new Element('label', {
				'text': 'Search'
			})
		);
		
		this._elSearch = new Element('input', {
			'type': 'text',
			'events': {
				'keydown:pause': this._search
			}
		}).inject(elSearchC);
		
		this._elResults = new Element('ul', {
			'class': 'results',
			'events': {
				'click:relay(li)': this._clickItem
			}
		});
		
		this._elTree = new Element('ul', {
			'class': 'tree shown',
			'events': {
				'click:relay(li)': this._clickItem
			}
		});
		
		if (tree && tree.length) {
			tree.each(function(item) {
				this._renderItem(item, this._elTree);
			}.bind(this));
		}
		
		var elActions = new Element('div', {
			'class': 'actions'
		}).adopt(
			new Element('a', {
				'title': 'Export data',
				'html': 'Export data',
				'events': {
					'click': this._download
				}
			}),
			new Element('a', {
				'title': 'Logout',
				'html': 'Logout',
				'events': {
					'click': this._logout
				}
			})
		);
		
		this.element.adopt(this._elOpts, this._elUpload, elSearchC, this._elResults, this._elTree, elActions);
	},
	
	_renderItem: function(item, elParent) {
		var elItem = null;
			
		if (item.folder) {
			elItem = new Element('li', {
				'class': 'folder ' + item.colour,
				'data-id': item._id
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
			
			if (item.items) {
				item.items.each(function(subItem) {
					this._renderItem(subItem, elTree);
				}.bind(this));
			}
			
			elItem.adopt(elMeta, this._renderSettings(item), elTree);
		} else {
			elItem = new Element('li', {
				'html': item.name,
				'data-id': item._id
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
			var blob = new Blob([content], {type: "application/zip"});
			var url = URL.createObjectURL(blob);
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
		
		this._db.addNote(this.options.defaultName, null, function(newNote) {
			this._elTree.grab(
				new Element('li', {
					text: this.options.defaultName,
					'data-id': newNote._id
				})
			)
		}.bind(this));
	},
	
	_logout: function() {
		this._db.logout(function() {
			// ?
			return;
		}.bind(this));
	},
	
	_clickItem: function(event) {
		var element = $(event.target);
		
		if (element.hasClass('setting') || element.getParent('.setting') || element.getParent('.settings')) return;
		
		if (element.get('tag') !== 'li') element = element.getParent('li');
		
		if (element.hasClass('folder')) {
			element.toggleClass('expanded');
		} else {
			var elExisting = this.element.getElements('.selected');
			for (var i = 0; elExisting && i < elExisting.length; i++) {
				elExisting[i].removeClass('selected');
			}
			
			this._content.setSelected(element.get('data-id'));
			
			element.addClass('selected');
		}
	},
	
	_addFolder: function(event) {
		this._db.addFolder(this.options.defaultFolderName, null, function(newFolder) {
			this._renderItem(newFolder, this._elTree);
		}.bind(this));
	},
	
	_deleteItem: function(item) {
		if (!item) return;
		
		var el = this._elTree.getElement('li[data-id="' + item + '"]');
		if (el) el.destroy();
	},
	
	_deleteFolder: function(event) {
		var element = $(event.target);
		var elFolder = element.getParent('.folder');
		var folder = elFolder.get('data-id');
		
		// TODO Move child elements to top level (DB does the same)
		// TODO Some kind of confirmation here before proceeding
		
		this._db.deleteFolder(folder, function() {
			if (elFolder) elFolder.destroy();
		}.bind(this));
	},
	
	_moveItem: function(item, moveTo) {
		if (!item) return;
		
		var elMovee = this._elTree.getElement('li[data-id="' + item + '"]');
		var elMoved = this._elTree.getElement('li[data-id="' + moveTo + '"] ul');
		if (!elMoved) elMoved = this._elTree;
		elMovee.inject(elMoved);
	},
	
	_changeName: function(event) {
		var element = $(event.target);
		var title = element.get('value');
		
		var elFolder = element.getParent('.folder');
		var folder = elFolder.get('data-id');
		
		this._db.renameFolder(folder, title, function() {
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
		var el = this._elTree.getElement('li[data-id="' + id + '"]');
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
	},
	
	focusSearch: function(event) {
		this._elSearch.focus();
	},
	
	_search: function(event) {
		var elItems = this._elTree.getElements('li[data-id]:not(.folder)');
		var searchText = this._elSearch.get('value').toLowerCase();
		
		this._elResults.removeClass('shown');
		this._elTree.addClass('shown');
		
		if (!searchText.length) return;
		
		this._elResults.getChildren().dispose();
		var found = false;
		
		for (var i = 0; i < elItems.length; i++) {
			if (elItems[i].get('text').toLowerCase().contains(searchText)) {
				if (!found) found = true;
				elItems[i].clone().inject(this._elResults);
			}
		}
		
		if (found) {
			this._elResults.addClass('shown');
			this._elTree.removeClass('shown');
		}
	}

});
