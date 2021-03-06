// NOTE: Old IDB code. Now using Mongo back-end. Could use IDB in future for offline storage.
marky.db = new Class({
	Implements: [Options, Events],

	Binds: [
		'open',
		'_opened',
		'_upgrade',
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
		dbname: 'marky',
		notestore: 'note',
		version: 3,
		// onOpen: function() {}
		// onError: function() {}
	},
	
	element: null,
	_request: null,
	_idb: null,

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
		this._request.onerror = this._error;
	},
	
	_opened: function(event) {
		this._idb = event.target.result;
		
		this.fireEvent('open');
	},
	
	_error: function(event) {
		this.fireEvent('error', [event]);
	},
	
	_upgrade: function(event) {
		var idb = event.target.result;
		
		var noteStore = idb.createObjectStore(this.options.notestore, { keyPath: "id", autoIncrement: true });
	},
	
	getTree: function(callback) {
		if (!this._idb) return;
		
		var tree = {};
		var treeFlat = {};
		
		var trx = this._idb.transaction(this.options.notestore);
		var store = trx.objectStore(this.options.notestore);
		var cursor = store.openCursor();
		
		cursor.onerror = this._error;
		cursor.onsuccess = function(event) {
			var cursor = event.target.result;

			if (cursor) {
				// Create own object
				var o = treeFlat[cursor.key] || {};
				
				// TODO Could just merge in whole IDB object?
				o.name = cursor.value.name;
				o.colour = cursor.value.colour;
				if (cursor.value.folder) o.folder = cursor.value.folder;
				
				treeFlat[cursor.key] = o;
				
				// Create/add to parent object
				if (cursor.value.parent) {
					treeFlat[cursor.value.parent] = treeFlat[cursor.value.parent] || {};
					var parent = treeFlat[cursor.value.parent];
					if (!parent.items) {
						parent.items = {};
					}
					
					parent.items[cursor.key] = o;
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
	
	dump: function(callback) {
		if (!this._idb) return;
		
		var data = [];
		
		var trx = this._idb.transaction(this.options.notestore);
		var store = trx.objectStore(this.options.notestore);
		var cursor = store.openCursor();
		
		cursor.onerror = this._error;
		cursor.onsuccess = function(event) {
			var cursor = event.target.result;

			if (cursor) {
				data.push(cursor.value);
				
				cursor.continue();
			} else {
				if (callback && typeOf(callback) === 'function') callback(data);
			}
		};
	},
	
	load: function(data, callback) {
		if (!this._idb || !data || !data.length) return;
		
		var trx = this._idb.transaction(this.options.notestore, 'readwrite');
		var store = trx.objectStore(this.options.notestore);
		var islooping = true,
			runCount = 0,
			callledback = false;
		
		data.each(function(item) {
			var request = store.add(item); // Adding as is for now. Do filtered insert later on
			runCount++;
			
			request.onerror = this._error;
			request.onsuccess = function(event) {
				runCount--;
				if (!callledback && !islooping && runCount === 0 && callback && typeOf(callback) === 'function') {
					callback();
					callledback = true;
				}
			}.bind(this);
		}.bind(this));
		
		islooping = false;
		if (!callledback && runCount === 0 && callback && typeOf(callback) === 'function') {
			callback();
			callledback = true;
		}
	},
	
	getFolders: function(callback) {
		if (!this._idb) return;
		
		var data = [];
		
		var trx = this._idb.transaction(this.options.notestore);
		var store = trx.objectStore(this.options.notestore);
		var cursor = store.openCursor();
		
		cursor.onerror = this._error;
		cursor.onsuccess = function(event) {
			var cursor = event.target.result;

			if (cursor) {
				if (cursor.value.folder) {
					data.push(cursor.value);
				}
				
				cursor.continue();
			} else {
				if (callback && typeOf(callback) === 'function') callback(data);
			}
		};
	},
	
	addNote: function(name, parentID, callback) {
		if (!this._idb) return;
		
		var trx = this._idb.transaction(this.options.notestore, 'readwrite');
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
	
	addFolder: function(name, parentID, callback) {
		if (!this._idb) return;
		
		var trx = this._idb.transaction(this.options.notestore, 'readwrite');
		var store = trx.objectStore(this.options.notestore);
		
		var request = store.add({
			name: name,
			parent: parentID || undefined,
			folder: true
		});
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			if (callback && typeOf(callback) === 'function') callback(event.target.result);
		}.bind(this);
	},
	
	deleteNote: function(noteID, callback) {
		if (!this._idb) return;
		
		var trx = this._idb.transaction(this.options.notestore, 'readwrite');
		var store = trx.objectStore(this.options.notestore);
		
		var request = store.delete(Number(noteID));
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			if (callback && typeOf(callback) === 'function') callback(event.target.result);
		}.bind(this);
	},
	
	getNote: function(key, callback) {
		if (!this._idb) return;
		
		var trx = this._idb.transaction(this.options.notestore);
		var store = trx.objectStore(this.options.notestore);
		var request = store.get(Number(key));
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			var note = request.result;
			if (callback && typeOf(callback) === 'function') callback(note);
		};
	},
	
	saveContent: function(noteID, content, callback) {
		if (!this._idb) return;
		
		// TODO Use getNote?
		
		var trx = this._idb.transaction(this.options.notestore, 'readwrite');
		var store = trx.objectStore(this.options.notestore);
		
		var request = store.get(Number(noteID));
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			var note = event.target.result;
			note.content = content;
			
			var r2 = store.put(note);
			
			r2.onerror = this.error;
			r2.onsuccess = callback;
		}.bind(this);
	},
	
	saveName: function(noteID, name, callback) {
		if (!this._idb) return;
		
		// TODO Use getNote?
		
		var trx = this._idb.transaction(this.options.notestore, 'readwrite');
		var store = trx.objectStore(this.options.notestore);
		
		var request = store.get(Number(noteID));
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			var note = event.target.result;
			note.name = name;
			
			var r2 = store.put(note);
			
			r2.onerror = this.error;
			r2.onsuccess = callback;
		}.bind(this);
	},
	
	saveColour: function(noteID, colour, callback) {
		if (!this._idb) return;
		
		// TODO Use getNote?
		
		var trx = this._idb.transaction(this.options.notestore, 'readwrite');
		var store = trx.objectStore(this.options.notestore);
		
		var request = store.get(Number(noteID));
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			var note = event.target.result;
			note.colour = colour;
			
			var r2 = store.put(note);
			
			r2.onerror = this.error;
			r2.onsuccess = callback;
		}.bind(this);
	},
	
	move: function(noteID, newParent, callback) {
		if (!this._idb) return;
		
		// TODO Use getNote?
		
		var trx = this._idb.transaction(this.options.notestore, 'readwrite');
		var store = trx.objectStore(this.options.notestore);
		
		var request = store.get(Number(noteID));
		
		request.onerror = this._error;
		request.onsuccess = function(event) {
			var note = event.target.result;
			note.parent = newParent;
			
			var r2 = store.put(note);
			
			r2.onerror = this.error;
			r2.onsuccess = callback;
		}.bind(this);
	}
});
