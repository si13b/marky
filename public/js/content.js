marky.content = new Class({
	Implements: [Options, Events],

	Binds: [
		'_render',
		'save',
		'_showFolders',
		'_selectFolder',
		'deselect',
		'setSelected',
		'getSelected',
		'_toggleMenu',
		'_changeName',
		'_delete',
		'openFind',
		'_onFindKey',
		'_findNext',
		'_findPrevious',
		'_find',
		'_closeFind'
	],

	options: {
		//onName
		//onDelete
		//onMove
	},
	
	element: null,
	_elTitle: null,
	_elTitleInput: null,
	_elToolbar: null,
	_ace: null,
	_elAce: null,
	_selected: null,
	_db: null,
	_note: null,
	_elPanel: null,
	_elFind: null,
	_elFindText: null,

	initialize: function(options, db) {
		this.setOptions(options);
		
		this._db = db;
		this.element = $$('.editor');
		this._elTitle = this.element.getElement('.title');
		this._elTitleInput = this._elTitle.getElement('input');
		this._elTitleInput.addEvents({
			'change': this._changeName
		});
		
		this._elToolbar = this.element.getElement('.toolbar');
		this._elAce = $$('#aceeditor');
		
		this._render();
	},
	
	_render: function() {
		this._ace = ace.edit("aceeditor");
		this._ace.setTheme("ace/theme/twilight");
		this._ace.setShowPrintMargin(false);
		this._ace.getSession().setMode("ace/mode/markdown");
		this._ace.getSession().setUseWrapMode(true);
		// TODO Add ctrl s to global too
		this._ace.commands.addCommand({
			name: 'save',
			bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
			exec: this.save
		});
		this._ace.commands.addCommand({
			name: 'myCommand',
			bindKey: {win: 'Ctrl-F',  mac: 'Command-F'},
			exec: this.openFind,
			readOnly: true // false if this command should not apply in readOnly mode
		});
		
		this._elToolbar.grab(
			new Element('div', {
				'class': 'alpha'
			}).adopt(
				new Element('button', {
					'title': 'Save',
					'html': 'Save',
					'events': {
						'click': this.save
					}
				}).grab(new Element('i', {'class': 'foundicon-checkmark'})),
				new Element('button', {
					'title': 'Move to',
					'html': 'Move to',
					'events': {
						'click': this._showFolders
					}
				}).grab(new Element('i', {'class': 'foundicon-folder'}))
			)
		);
		
		this._elToolbar.grab(new Element('div', {
			'class': 'beta'
		}).adopt(
			new Element('a', {
				'title': 'Delete note',
				'html': 'Delete note',
				'events': {
					'click': this._delete
				}
			})
		));
		
		// TODO Undo
	},
	
	save: function() {
		this._db.saveContent(this._selected, this._ace.getValue(), function() {
			console.log('Successfully saved');
			new marky.msg({}).show('Successfully saved');
		}.bind(this));
	},
	
	_showFolders: function(event) {
		var element = $(event.target);
		
		if (element.get('tag') !== 'div') element = element.getParent('div');
		
		this._db.getFolders(function(folders) {
			this._elPanel = new marky.panel({});
			
			var elList = new Element('ul', {
				'events': {
					'click:relay(li)': this._selectFolder
				}
			});
			
			elList.grab(new Element('li', {
				'html': 'None',
			}));
			
			Object.each(folders, function(item) {
				elList.grab(new Element('li', {
					'data-id': item._id,
					'html': item.name
				}));
			}.bind(this));
			
			this._elPanel.toElement().grab(elList);
			this._elPanel.show({
				relativeTo: element,
				position: 'bottomLeft'
			});
		}.bind(this));
	},
	
	_selectFolder: function(event) {
		var element = $(event.target);
		
		var moveTo = element.get('data-id');
		
		this._elPanel.close();
		
		this._db.move(this._selected, moveTo, function() {
			this.fireEvent('move', [this._selected, moveTo]);
		}.bind(this));
	},
	
	_delete: function(event) {
		if (!this._selected) return;
		
		this._db.deleteNote(this._selected, function(newID) {
			//var el = this._elList.getElement('li[data-id="' + this._selected + '"]');
			//if (el) el.destroy();
			this.fireEvent('delete', this._selected);
			this.deselect();
		}.bind(this));
	},
	
	deselect: function() {
		this._note = null;
		this._selected = null
		this.element.removeClass('selected');
		this._ace.setValue('');
		this._elTitleInput.set('value', '');
	},
	
	setSelected: function(id) {
		if (this._selected) {
			this._db.saveContent(this._selected, this._ace.getValue());
		}
		
		this._selected = id;
		this._note = null;
		
		this._db.getNote(id, function(note) {
			this._note = note;
			this._ace.setValue(note.content || '');
			this._ace.moveCursorTo(0, 0);
			this._ace.focus();
			this._elTitleInput.set('value', note.name);
			this.element.addClass('selected');
		}.bind(this));
	},
	
	getSelected: function() {
		return this._selected;
	},
	
	_changeName: function(event) {
		if (!this._selected) return;
		
		var element = $(event.target);
		var title = element.get('value');
		
		this._db.saveName(this._selected, title, function() {
			this.fireEvent('changeName', [this._selected, title]);
		}.bind(this));
	},
	
	openFind: function() {
		if (this._elFind) return;
		
		this._elFindText = new Element('input', {
			'type': 'text',
			'events': {
				'keypress': this._onFindKey
			}
		});
		
		this._elFind = new Element('div', {
			'class': 'find'
		}).adopt(
			new Element('div', {
				'class': 'field'
			}).adopt(
				new Element('label', {
					'text': 'Find: '
				}),
				this._elFindText
			),
			new Element('div', {
				'class': 'actions'
			}).adopt(
				new Element('button', {
					'text': 'Find next',
					'events': {
						'click': this._findNext
					}
				}),
				new Element('button', {
					'text': 'Find previous',
					'events': {
						'click': this._findPrevious
					}
				}),
				new Element('button', {
					'text': 'Cancel',
					'events': {
						'click': this._closeFind
					}
				})
			)
		);
		
		$(document.body).grab(this._elFind);
		
		this._elFindText.focus();
	},
	
	_onFindKey: function(event) {
		if (event.key === 'enter') this._findNext();
		if (event.key === 'esc') this._closeFind();
	},
	
	_findNext: function() {
		this._find(false);
	},
	
	_findPrevious: function() {
		this._find(true);
	},
	
	_find: function(isBackwards) {
		var searchText = this._elFindText.get('value');
		
		if (!searchText || !searchText.length) return;
		
		this._ace.find(searchText, {
			backwards: isBackwards,
			wrap: false,
			caseSensitive: false,
			wholeWord: false,
			regExp: false
		});
	},
	
	_closeFind: function() {
		this._elFind.dispose();
		this._elFind = null;
		this._ace.focus();
	}
});
