marky.db = new Class({
	Implements: [Options, Events],

	Binds: [
		'open',
		'_opened',
		'_upgrade',
		'getTree',
		'getContent',
		'addNote',
		'deleteNote',
		'saveContent'
	],

	options: {
		dbname: 'markyDB',
		notestore: 'note',
		version: 1,
		// onOpen: function() {}
		// onError: function() {}
	},
	
	element: null,
	_request: null,
	_db: null,

	initialize: function(options) {
		this.setOptions(options);
		
		this.open();
	},
	
	open: function() {
		window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
		window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

		if (!window.indexedDB) return; // TODO Handle better
		
		this._request = window.indexedDB.open(this.options.dbname, this.options.version);
		
		this._request.onupgradeneeded = this._upgrade;
		this._request.onsuccess = this._opened;
		this._request.onerror = this._opened;
	},
	
	_opened: function(event) {
		this._db = event.target.result;
		
		this.fireEvent('open');
	},
	
	_error: function(event) {
		this.fireEvent('error', [event]);
	},
	
	_upgrade: function(event) {
		var db = event.target.result;
		
		var noteStore = db.createObjectStore(this.options.notestore, { keyPath: "id", autoIncrement: true });
	},
	
	getTree: function(callback) {
		if (!this._db) return;
		
		var tree = {};
		var treeFlat = {};
		
		var trx = this._db.transaction(this.options.notestore);
		var store = trx.objectStore(this.options.notestore);
		var cursor = store.openCursor();
		
		cursor.onerror = this._error;
		cursor.onsuccess = function(event) {
			var cursor = event.target.result;

			if (cursor) {
				// Create own object
				var o = treeFlat[cursor.key] || {};
				o[name] = cursor.value.name;
				
				treeFlat[cursor.key] = o;
				
				// Create/add to parent object
				if (cursor.value.parent) {
					treeFlat[cursor.value.parent] = treeFlat[cursor.value.parent] || {};
					var parent = treeFlat[cursor.value.parent];
					if (!parent.items) {
						parent.items = [
							o
						];
					}
				} else {
					// No parent? Add to top level
					tree[cursor.key] = o;
				}
				
				cursor.continue();
			} else {
				if (callback && typeOf(callback) === 'function') callback(tree);
			}
		};
	},
	
	addNote: function(name, parentID, callback) {
		if (!this._db) return;
		
		var trx = this._db.transaction(this.options.notestore);
		var store = trx.objectStore(this.options.notestore);
		
		var request = store.add({
			name: name,
			parent: parentID || undefined,
			content: ''
		});
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			if (callback && typeOf(callback) === 'function') callback(event.target.result);
		}.bind(this);
	},
	
	deleteNote: function(noteID, callback) {
		if (!this._db) return;
		
		var trx = this._db.transaction(this.options.notestore);
		var store = trx.objectStore(this.options.notestore);
		
		var request = store.delete(noteID);
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			if (callback && typeOf(callback) === 'function') callback(event.target.result);
		}.bind(this);
	},
	
	getContent: function(key, callback) {
		if (!this._db) return;
		
		var trx = this._db.transaction(this.options.notestore);
		var store = trx.objectStore(this.options.notestore);
		var request = store.get(key);
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			if (callback && typeOf(callback) === 'function') callback(event.target.result);
		};
	},
	
	saveContent: function(noteID, content, callback) {
		if (!this._db) return;
		
		var trx = this._db.transaction(this.options.notestore);
		var store = trx.objectStore(this.options.notestore);
		
		var request = store.get(noteID);
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			var note = event.target.result;
			note.content = content;
			
			var r2 = store.put(note);
			
			r2.onerror = this.error;
			r2.onsuccess = callback;
		}.bind(this);
	}
});
