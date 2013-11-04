marky.panel = new Class({
	Implements: [Options, Events],

	Binds: [
		'toElement',
		'_render',
		'show',
		'close',
		'openFind'
	],

	options: {
		classes: null
	},
	
	element: null,
	_overlay: null,
	_position: null,

	initialize: function(options) {
		this.setOptions(options);
		
		this._render();
	},
	
	toElement: function() {
		return this.element;
	},
	
	_render: function() {
		this.element = new Element('div', {
			'class': 'panel ' + this.options.classes
		});
		
		this._overlay = new Element('div', {
			'class': 'overlay',
			'events': {
				'click': this.close
			}
		});
	},
	
	show: function(position) {
		this._position = position || {
			relativeTo: $(document.body),
			position: 'topLeft'
		};
		
		$(document.body).grab(this.element);
		$(document.body).grab(this._overlay);
		
		this.element.position(this._position);
	},
	
	close: function() {
		this.element.destroy();
		this._overlay.destroy();
	}

});
