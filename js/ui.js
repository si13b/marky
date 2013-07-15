var marknote = {};

(function () {
	var ui = new Class({
		Implements: [Options, Events],
	
		Binds: [
		],
	
		options: {
		},
		
		element: null,
	
		initialize: function(options) {
			this.setOptions(options);
			
			var editor = ace.edit("aceeditor");
			editor.setTheme("ace/theme/monokai");
			editor.getSession().setMode("ace/mode/markdown");
		}
	
	});

	window.addEvent('domready', function() {
		marknote.ui = new ui();
	});
})();