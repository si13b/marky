marky.msg = new Class({
	Implements: [Options, Events],

	Binds: [
		'show',
		'hide'
	],

	options: {
		timeout: 1000
	},
	
	element: null,

	initialize: function(options) {
		this.setOptions(options);
	},
	
	show: function(message) {
		this.element = new Element('div', {
			'class': 'msg'
		}).grab(
			new Element('div', {
				'html': message
			})
		);
		
		this.element.grab(new Element('button', {
			'text': 'OK',
			'events': {
				'click': this.hide
			}
		}));
		
		document.body.grab(this.element);
		
		this.hide.delay(this.options.timeout);
	},
	
	hide: function(event) {
		this.element.destroy();
	},
});
