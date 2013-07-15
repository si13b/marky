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
	
		initialize: function(options) {
			this.setOptions(options);
			
			
		},
		
		render: function() {
			var editor = ace.edit("aceeditor");
			editor.setTheme("ace/theme/monokai");
			editor.getSession().setMode("ace/mode/markdown");
		}
	
	});

	window.addEvent('domready', function() {
		marky.ui = new ui();
	});
})();