/*
 *Kudos: http://javascript.crockford.com/inheritance.html, http://fitzgeraldnick.com/weblog/26/, http://davidwalsh.name/arguments-array, http://phrogz.net/JS/Classes/OOPinJS2.html
 */

var Class = function() {
    var that = this;
    this.methods = {};
    this.fields = {};
    this.options = null;
    
    this.theClass = function(initOptions) {
        this.options = that.options || {};
        
        if (initOptions) {
            for (name in initOptions) {
                this.options[name] = initOptions[name];
            }
        }
        
        console.dir(this.options);
        
        for (var name in that.methods) {
            if (that.methods.hasOwnProperty(name)) {
                this[name] = that.methods[name].bind(this);
            }
        }
        for (var name in that.fields) {
            if (that.fields.hasOwnProperty(name)) {
                this[name] = that.fields[name] || null;
            }
        }
    };
};

Class.prototype.create = function(options) {
    return new this.theClass(options);
};

Class.prototype.field = function(name, func) {
    this.fields[name] = func;
};

Class.prototype.method = function(name, func) {
    this.methods[name] = func;
};

Class.prototype.defaultOptions = function(initOptions) {
    this.options = initOptions;
};

var bind = function (scope, fn) {
    return function () {
        return fn.apply(scope, Array.prototype.slice.call(arguments));
    };
};

Function.prototype.bind = function(scope) {
    var outerScope = this;
    return function () {
        return outerScope.apply(scope, Array.prototype.slice.call(arguments));
    };
};

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

exports.Class = Class;
exports.bind = bind;