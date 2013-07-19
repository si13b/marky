marky.content = new Class({
	Implements: [Options, Events],

	Binds: [
		'_render',
		'save',
		'deselect',
		'setSelected',
		'getSelected',
		'_changeName'
	],

	options: {
		//onName
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
		
		// TODO
		this._elToolbar.grab(new Element('div', {
			'html': '★',
			'title': 'Save',
			'events': {
				'click': this.save
			}
		}));
		/* TODO Put in sub menu
		 *this._elToolbar.grab(new Element('div', {
			'html': '✕',
			'title': 'Delete',
			'events': {
				'click': this._deleteItem
			}
		}));*/
	},
	
	save: function() {
		this._db.saveContent(this._selected, this._ace.getValue(), function() {
			console.log('Successfully saved');
			new marky.msg({}).show('Successfully saved');
		}.bind(this));
	},
	
	deselect: function() {
		this._note = null;
		this._selected = null
		this.element.removeClass('selected');
		this._ace.setValue('');
		this._elTitle.set('html', '');
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
	}

});
