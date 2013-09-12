marky.request = new Class({
	Implements: [Options, Events],

	Binds: [
		'_error',
		'getTree',
		'dump',
		'load',
		'getFolders',
		'getNote',
		'addNote',
		'addFolder',
		'deleteNote',
		'saveColour',
		'saveContent',
		'saveName',
		'move'
	],

	options: {
	},

	initialize: function(options) {
		this.setOptions(options);
	},
	
	_error: function(event) {
		this.fireEvent('error', [event]);
	},
	
	dump: function(callback) {
		new Request.JSON({url: '/download', onSuccess: callback, onError: this._error, onFailure: this._error}).post({});
	},
	
	getTree: function(callback) {
		new Request.JSON({url: '/folder/tree', onSuccess: callback, onError: this._error, onFailure: this._error}).post({});
	},
	
	getFolders: function(callback) {
		new Request.JSON({url: '/folder/list', onSuccess: callback, onError: this._error, onFailure: this._error}).post({});
	},
	
	addFolder: function(name, parentID, callback) {
		new Request.JSON({url: '/folder/add', onSuccess: callback, onError: this._error, onFailure: this._error}).post({
			name: name,
			parent: parentID || undefined,
			folder: true
		});
	},
	
	saveColour: function(noteID, colour, callback) {
		new Request.JSON({url: '/folder/colour', onSuccess: callback, onError: this._error, onFailure: this._error}).post({
			note: noteID,
			colour: colour
		});
	},
	
	addNote: function(name, parentID, callback) {
		new Request.JSON({url: '/note/add', onSuccess: callback, onError: this._error, onFailure: this._error}).post({
			name: name,
			parent: parentID || undefined,
			content: ''
		});
	},
	
	deleteNote: function(noteID, callback) {
		new Request.JSON({url: '/note/delete', onSuccess: callback, onError: this._error, onFailure: this._error}).post({
			note: noteID
		});
	},
	
	getNote: function(key, callback) {
		new Request.JSON({url: '/note/content/get', onSuccess: callback, onError: this._error, onFailure: this._error}).post({
			note: key
		});
	},
	
	saveContent: function(noteID, content, callback) {
		new Request.JSON({url: '/note/content/save', onSuccess: callback, onError: this._error, onFailure: this._error}).post({
			note: noteID,
			content: content
		});
	},
	
	saveName: function(noteID, name, callback) {
		new Request.JSON({url: '/note/rename', onSuccess: callback, onError: this._error, onFailure: this._error}).post({
			note: noteID,
			name: name
		});
	},
	
	move: function(noteID, newParent, callback) {
		new Request.JSON({url: '/note/move', onSuccess: callback, onError: this._error, onFailure: this._error}).post({
			note: noteID,
			parent: newParent
		});
	}
});