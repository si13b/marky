marky.request = new Class({
	Implements: [Options, Events],

	Binds: [
		'_error',
		'_failure',
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
	
	onError: function(event) {
		if (Number(event.status) === 401) {
			window.location = 'index.html';
		} else {
			this.fireEvent('error', [event]);
		}
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
	
	send: function(url, sendData, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState !== 4) return;
			if (xhr.status !== 200) {
				this.onError(xhr);
				return;
			}
			var responseJSON = JSON.parse(xhr.responseText);
			if (responseJSON && responseJSON.unauthenticated) {
				window.location = 'index.html';
				return;
			}
			
			if (callback) callback(responseJSON);
		}.bind(this);
		xhr.open('POST', url);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.send(sendData ? JSON.stringify(sendData) : '{}');
	},
	
	// TODO These are redundant - call send directly from source
	getTree: function(callback) {
		this.send('/folder/tree', null, callback);
	},
	
	getFolders: function(callback) {
		this.send('/folder/list', null, callback);
	},
	
	addFolder: function(name, parentID, callback) {
		this.send('/folder/add', {
			name: name,
			parent: parentID || undefined,
			folder: true
		}, callback);
	},
	
	saveColour: function(folderID, colour, callback) {
		this.send('/folder/colour', {
			folder: folderID,
			colour: colour
		}, callback);
	},
	
	addNote: function(name, parentID, callback) {
		this.send('/note/add', {
			name: name,
			parent: parentID || undefined,
			content: ''
		}, callback);
	},
	
	deleteNote: function(noteID, callback) {
		this.send('/note/delete', {
			note: noteID
		}, callback);
	},
	
	deleteFolder: function(folderID, callback) {
		this.send('/folder/delete', {
			folder: folderID
		}, callback);
	},
	
	getNote: function(key, callback) {
		this.send('/note/content/get', {
			note: key
		}, callback);
	},
	
	logout: function(callback) {
		this.send('/logout', null, callback);
	},
	
	saveContent: function(noteID, content, callback) {
		this.send('/note/content/save', {
			note: noteID,
			content: content
		}, callback);
	},
	
	saveName: function(noteID, name, callback) {
		this.send('/note/rename', {
			note: noteID,
			name: name
		}, callback);
	},
	
	renameFolder: function(folderID, name, callback) {
		this.send('/folder/rename', {
			folder: folderID,
			name: name
		}, callback);
	},
	
	move: function(noteID, newParent, callback) {
		this.send('/note/move', {
			note: noteID,
			parent: newParent
		}, callback);
	}
});
