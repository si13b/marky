marky.db = new Class({
	Implements: [Options, Events],

	Binds: [
		'open',
		'retrieve',
		'store'
	],

	options: {
		dbname: 'markyDB',
		treestore: 'tree',
		version: 1
	},
	
	element: null,
	_request: null,
	_objectStore: null,

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
		
		this._request.onupgradeneeded = function(event) { 
			var db = event.target.result;
			
			// Create an objectStore for this database
			this._objectStore = db.createObjectStore(this.options.treestore, { keyPath: "name" });
			
			this._objectStore.add({
				name: 'root',
				children: []
			});
		};
	},
	
	retrieve: function(callback) {
		if (!this._request) return; // TODO Report error better
		
		/*this._dbcon.getCursor(this.options.name, function(ixDbCursorReq) {
			if (!ixDbCursorReq) return;
			
			ixDbCursorReq.onsuccess = function(e) {
				var result = ixDbCursorReq.result || e.result;
				
				if (!result) {
					result = {
						id: 'root',
						childnodes: []
					};
					
					this.store(result);
				}
				
				if (typeOf(callback) === 'function') callback(result);
			}.bind(this);
		}.bind(this), undefined, IDBKeyRange.only("root"), true, "ixPathField");*/
	},
	
	store: function(obj) {
		this._dbcon.add(this.options.name, obj);
		
	}

});
