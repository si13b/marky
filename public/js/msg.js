marky.msg = new Class({
	Implements: [Options, Events],

	Binds: [
		'show',
		'hide'
	],

	options: {
		timeout: 1000,
		buttons: ['ok']
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
		
		var elButtons = new Element('div', {
			'class': 'buttons'
		});
		
		if (this.options.buttons) {
			this.options.buttons.forEach(function(item, index) {
				if (item === 'ok') {
					elButtons.grab(new Element('button', {
							'text': 'OK',
						'events': {
							'click': this.hide
						}
					}));
				} else if (item === 'close') {
					elButtons.grab(new Element('button', {
							'text': 'Close',
						'events': {
							'click': this.hide
						}
					}));
				}
			}.bind(this))
		}
		
		this.element.grab(elButtons);
		
		document.body.grab(this.element);
		
		this.hide.delay(this.options.timeout);
	},
	
	hide: function(event) {
		this.element.destroy();
	},
});
