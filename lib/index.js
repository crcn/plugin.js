var copy = function(from, to) {
	if(!to) to = {};
	for(var i in from) to[i] = from[i];
}

module.exports = function() {
	
	var options = {}

	var self = {
		
		/**
		 */

		'require': function() {
			
			return this;
		},

		/**
		 */
		
		'options': function(target, override) {
			
			if(arguments.length) {

				if(override) {
					options = target;
				} else {
					copy(target, options);
				}

				return this;
			}

			return options;
		}
	};


	return self;
};