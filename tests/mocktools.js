
var Class = function(classObj) {
	return classObj; // Fall straight through, store as POjsO
};

var Element = function(type, options) {
	//console.log('type: ' + type + ', options: ' + options);
	this.type = type;
	this.options = options;
	this.children = [];
};

Element.prototype.hasClass = function(className) {
	return !!(this.options && this.options['class'] && this.options['class'].indexOf(className) >= 0);
};

Element.prototype.toggleClass = function(className) {
	if (!this.options) this.options = {};
	if (!this.options['class']) this.options['class'] = '';
	
	var indexOf = this.options['class'].indexOf(className);
	if (indexOf >= 0) {
		var pre = this.options['class'].substr(0, this.options['class'].indexOf(className)),
			post = this.options['class'].substr(this.options['class'].indexOf(className) + className.length);
		
		this.options['class'] = pre + post;
	} else {
		this.options['class'] += ' ' + className;
	}
};

Element.prototype.getParent = function() {
	return this.__getParentMock.l[this.__getParentMock.i++];
};

Element.prototype.__addGetParentMock = function(mockReturn) {
	this.__getParentMock = this.__getParentMock || {
		i: 0,
		l: []
	};
	
	this.__getParentMock.l.push(mockReturn);
};

Element.prototype.getChildren = function() {
	return this.__getChildrenMock.l[this.__getChildrenMock.i++];
};

Element.prototype.__addGetChildrenMock = function(mockReturn) {
	this.__getChildrenMock = this.__getChildrenMock || {
		i: 0,
		l: []
	};
	
	this.__getChildrenMock.l.push(mockReturn);
};

Element.prototype.grab = function(element) {
	if (!element) return this;
	this.children.push(element);
	
	return this;
};

Element.prototype.adopt = function() {
	if (!arguments || arguments.length === 0) return this;
	if (!arguments.length) this.grab(arguments);
	
	this.children = this.children || [];
	
	for (var i = 0; i < arguments.length; i++) {
		if (arguments[i]) this.children.push(arguments[i]);
	}
	
	return this;
};

Element.prototype.inject = function(element) {
	if (!element) return this;
	element.grab(this);
	
	return this;
};

var Arrayerizer = function(arrayProto) {
	arrayProto.each = arrayProto.forEach;
};

var Moo = function(obj) {
	if (typeof obj === 'string') {
		return null; // TODO Look for mock query string returns?
	} else {
		return obj;
	}
};

module.exports = {
	Class: Class,
	Element: Element,
	Options: {},
	Events: {},
	Moo: Moo,
	Arrayerizer: Arrayerizer
};