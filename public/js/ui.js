var marky = {};

(function () {
	var UI = new Class({
		Implements: [Options, Events],
	
		Binds: [
			'render',
			'_onDBOpen'
		],
	
		options: {
		},
		
		element: null,
		_nav: null,
		_db: null,
		_content: null,
	
		initialize: function(options) {
			this.setOptions(options);
			
			this.render();
		},
		
		render: function() {
			this._db = new marky.request();
			this._content = new marky.content({}, this._db);
			this._nav = new marky.nav({}, this._content, this._db);
			
			Keyboard.manager.addEvents({
				'ctrl+e': this._nav.focusSearch,
				'ctrl+f': this._content.openFind
			});
		}
	});

	window.addEvent('domready', function() {
		marky.ui = new UI();
	});
})();