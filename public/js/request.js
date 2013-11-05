marky.request = new Class({
	Implements: [Options, Events],

	Binds: [
		'_error',
		'getTree',
		'dump',
		'load',
		'getFolders',
		'getNote',
		'logout',
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
		var oReq = new XMLHttpRequest();
		oReq.open("POST", "/download", true);
		oReq.responseType = "arraybuffer";

		oReq.onload = function(oEvent) {
			
			if (callback) callback(oReq.response);
		};
		
		oReq.send();
	},
	
	getTree: function(callback) {
		new Request.JSON({url: '/folder/tree', onSuccess: function(result) {
			// TODO Should use HTTP response codes for unauthenticated
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({});
	},
	
	getFolders: function(callback) {
		new Request.JSON({url: '/folder/list', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({});
	},
	
	addFolder: function(name, parentID, callback) {
		new Request.JSON({url: '/folder/add', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			name: name,
			parent: parentID || undefined,
			folder: true
		});
	},
	
	saveColour: function(folderID, colour, callback) {
		new Request.JSON({url: '/folder/colour', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			folder: folderID,
			colour: colour
		});
	},
	
	addNote: function(name, parentID, callback) {
		new Request.JSON({url: '/note/add', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			name: name,
			parent: parentID || undefined,
			content: ''
		});
	},
	
	deleteNote: function(noteID, callback) {
		new Request.JSON({url: '/note/delete', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			note: noteID
		});
	},
	
	deleteFolder: function(folderID, callback) {
		new Request.JSON({url: '/folder/delete', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			folder: folderID
		});
	},
	
	getNote: function(key, callback) {
		new Request.JSON({url: '/note/content/get', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			note: key
		});
	},
	
	logout: function(callback) {
		new Request.JSON({url: '/logout', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({});
	},
	
	saveContent: function(noteID, content, callback) {
		new Request.JSON({url: '/note/content/save', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			note: noteID,
			content: content
		});
	},
	
	saveName: function(noteID, name, callback) {
		new Request.JSON({url: '/note/rename', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			note: noteID,
			name: name
		});
	},
	
	renameFolder: function(folderID, name, callback) {
		new Request.JSON({url: '/folder/rename', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			folder: folderID,
			name: name
		});
	},
	
	move: function(noteID, newParent, callback) {
		new Request.JSON({url: '/note/move', onSuccess: function(result) {
			if (result.unauthenticated) {
				window.location = 'login.html';
				return;
			}
			
			if (callback) callback(result);
		}, onError: this._error, onFailure: this._error}).post({
			note: noteID,
			parent: newParent
		});
	}
});
