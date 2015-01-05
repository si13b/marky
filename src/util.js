module.exports = {
	/**
	 * Utilise the passed object as a traditional OOP-pattern class.
	 *
	 * A function stored in the "init" parameter will be treated as the users "constructor".
	 *
	 * All methods will be auto-bound (add an exclude property later if necessary).
	 *
	 * @param source An object of properties to copy over for each "instance"
	 * @returns {Function} Returns the constructor function that auto-binds methods upon "new" call and
	 * calls the users constructor.
	 */
	Class: function(source) {
		return function() {
			for (prop in source) {
				if (typeof source[prop] === 'function') {
					// Auto-bind functions
					this[prop] = source[prop].bind(this);
				} else if (prop !== 'init') {
					// Otherwise copy (unless special init param)
					this[prop] = source[prop];
				}
			}

			if (this.init) this.init.apply(this, arguments);
		};
	}

};