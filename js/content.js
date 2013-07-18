marky.content = new Class({
	Implements: [Options, Events],

	Binds: [
		'setSelected'
	],

	options: {
	},
	
	element: null,
	_ace: null,
	_elAce: null,
	_selected: null,
	_db: null,

	initialize: function(options, db) {
		this.setOptions(options);
		
		this._db = db;
		this.element = $$('.editor');
		this._elAce = $$('#aceeditor');
		
		this._ace = ace.edit("aceeditor");
		this._ace.setTheme("ace/theme/monokai");
		this._ace.setShowPrintMargin(false);
		this._ace.getSession().setMode("ace/mode/markdown");
		
		
	},
	
	setSelected: function(id) {
		if (this._selected) {
			this._db.saveContent(this._selected, this._ace.getValue());
		}
		
		this._selected = id;
		
		this._db.getContent(id, function(content) {
			this._ace.setValue(content || '');
			this._elAce.addClass('selected');
		}.bind(this));
	}

});
