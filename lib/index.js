var path = require('path');

var copy = function(from, to) {
	if(!to) to = {};
	for(var i in from) to[i] = from[i];
}


var fileExists = function(file) {
	try {
		fs.statSync(file);
		return true;
	} catch (e) {
		return false;
	}
}

var resolveJs = function(file) {
	try {
		return require.resolve(file);
	} catch (e) {
		return false;
	}
}


module.exports = function() {
	
	//options passed to every plugin
	var options = {}, 

	//paths to scan for modules
	paths = [],

	//params specific to each plugin
	params = {},
	
	//required paths
	required = [],

	//loaded plugins
	plugins = {},

	initialized = false;




	var self = {
		
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
		},

		/**
		 */
		
		'params': function(name, value) {
			if(typeof name == 'object') {
				
				for(var prop in name) {
					self.params(prop, name[prop]);
				} 

				return;
			}

			params[name] = value;
		}, 

		/**
		 */

		'paths': function() {

			if(arguments.length) {

				Array.apply(null, arguments).forEach(function(fullPath) {
					
					var normPath = path.normalize(fullPath);

					//no dupes
					if(paths.indexOf(normPath) > -1) return;

					paths.push(normPath);
				});

				return this;
			}

			return paths;
		},

		/**
		 */

		'loaders': [],

		/**
		 */

		'require': function() {


			Array.apply(null, arguments).forEach(function(plugin) {
				self.loaders.forEach(function(loader) {
					
					if(loader.test(plugin)) {
							
						loader.load(plugin, function(instance, name) {

							plugins[name] = {
								instance: instance.plugin(options, params[name] || {}),
								require: instance.require
							};

						});
					}

				});
			});

			return this;
		},

		/**
		 */

		'plugin': function(search) {

			return self.plugins(search)[0];
		},

		/**
		 */

		'plugins': function(search) {

			var matches = [], tos = typeof search, reg, test;

			if(tos == 'string') {

				reg = new RegExp(search);

			} else if(!(search instanceof RegExp)) {

				reg = search;
			} else {
				reg = search;
			}

			if(reg instanceof RegExp) {

				test = function(name) {

					return !!name.match(reg);
				}
			} else {

				test = reg;
			}
			
			for(var name in plugins) {

				if(test(name)) {

					matches.push(name);
				}
			}	

			return matches;
		},

		/**
		 */

		'call': function(type) {

			if(!initialized) {
				initialized = true;


			}

			for(var name in plugins) {
				var plugin = plugins[name];

				if(plugin.instance[type]) plugin.instance[type];
			}	
		},

		/**
		 */

		'init': function() {
			return this.call('init');
		}
	};


	//node.js
	if(typeof window == 'undefined') {

		var fs = require('fs');
		
		var loadJsFile = {
			test: function(path) {

				return resolveJs(path);
			},
			load: function(path) {

				require(path)
			}
		}

		var loadDirectory = {
			test: function(path) {

				return fileExists(path) && fs.statSync(path).isDirectory();
			},
			load: function(path) {

				fs.readdirSync(path).forEach(function(basename) {
					
					var fullPath = path + '/' + basename;

				});
			}
		}
	
	//online
	} else {
		
	}


	return self;
};