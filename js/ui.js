var marky = {};

(function () {
	var ui = new Class({
		Implements: [Options, Events],
	
		Binds: [
			'render'
		],
	
		options: {
		},
		
		element: null,
		_nav: null,
		_db: null,
	
		initialize: function(options) {
			this.setOptions(options);
			
			this.render();
		},
		
		render: function() {
			var editor = ace.edit("aceeditor");
			editor.setTheme("ace/theme/monokai");
			editor.getSession().setMode("ace/mode/markdown");
			
			this._db = new marky.db({});
			this._nav = new marky.nav({}, this._db);
			
			// TODO bottom tabs? Edit, Preview, Manage (icon)
		}
	
	});

	window.addEvent('domready', function() {
		marky.ui = new ui();
	});
})();