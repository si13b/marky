marky.editor = new Class({
	Implements: [Options, Events],

	Binds: [
		'render'
	],

	options: {
	},
	
	element: null,

	initialize: function(options) {
		this.setOptions(options);
		
		this.render();
	},
	
	render: function() {
		
	}

});
