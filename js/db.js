marky.db = new Class({
	Implements: [Options, Events],

	Binds: [
		'retrieve',
		'store'
	],

	options: {
		name: 'markyDB'
	},
	
	element: null,
	_dbddl: null,
	_dbcon: null,

	initialize: function(options) {
		this.setOptions(options);
		
		this._dbddl = (
			function() {
				ixDbEz.createObjStore(this.options.name, "pathField", false);
				ixDbEz.createIndex(this.options.name, "ixPathField", "pathField", true);
			}.bind(this)
		);
		
		this._dbcon = ixDbEz.startDB(this.options.name, 2, this._dbddl, undefined, undefined, false);
		
		// TODO not supported -> if (!window.indexedDB) return;
	},
	
	retrieve: function(callback) {
		ixDbEz.getCursor(this.options.name, function(ixDbCursorReq) {
			if (!ixDbCursorReq) return;
			
			ixDbCursorReq.onsucess = function(e) {
				var result = ixDbCursorReq.result || e.result;
				
				if (!result) {
					result = {
						path: 'root'
					};
					
					this.store(result);
				}
				
				if (typeOf(callback) === 'function') callback(result);
			};
		}, undefined, IDBKeyRange.only("root"), true, "ixPathField");
	},
	
	store: function(obj) {
		ixDbEz.add(this.options.name, obj);
	}

});
