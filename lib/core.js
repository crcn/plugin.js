var path = require('path'),
queue = require('./queue'),
EventEmitter = require('events').EventEmitter;


var copy = function(from, to) {
	if(!to) to = {};

	for(var i in from) to[i] = from[i];

	return to;
}


var nativeResolve = function(file) {
	try {
		return require.resolve(file);
	} catch (e) {
		return false;
	}
}


var normalizeRequired = function(req) {

	if(typeof req == 'string' || typeof req == 'function' || req instanceof RegExp) req = [req];

	var normalized = [];

	if(req instanceof Array) {
		for(var i = req.length; i--;) {
			normalized.push({
				search: req[i],
				name: typeof req[i] == 'string' ? req[i] : null
			});
		}
	} else {
		for(var name in req) {
			var v = req[name],
			params = {};

			if(typeof v == 'object') {
				params = v;
			} else {
				params.search = v;
			}

			params.name = typeof v == 'string' ? v : null;
			

			normalized.push(params);
		}	
	}
	
	return normalized;
}

module.exports = function() {
	
	//options passed to every plugin
	var options = {}, 

	//paths to scan for modules
	paths       = [],

	//params specific to each plugin
	params      = {},
	
	//required paths
	required    = [],

	//loaded plugins
	plugins     = {},

	//module paths - check if they've already been loaded
	included    = {},

	//TRUE on first call
	initialized = false,

	//waiting for modules to load before initializing
	q          = queue(),

	//number of modules loading
	numLoading = 0,

	self;

	// em = new EventEmitter();


	var resolve = function(jsPath) {
		var fullPath;
		
		if(fullPath = nativeResolve(jsPath)) return fullPath;

		for(var i = paths.length; i--;) {
			var incPath = paths[i];
			if(fullPath = nativeResolve(incPath + '/' + jsPath)) return fullPath;
		}

		return null;
	}


	var initModules = function() {
		if(initialized) return;
		initialized = true;

		for(var name in plugins) {
			var plugin = plugins[name];
			
			(plugin.require || []).forEach(function(req) {
				var plugins = self.plugins(req.search);
				
				if(!plugins.length) throw new Error('Unable to find plugin ' + req.search + ' in ' + name);

				var instances = [];

				for(var i = plugins.length; i--;) {
					instances.push(plugins[i].instance);
				}

				plugin.instance.require = {};


				//include the instance if it exists
				if(req.name) {
						plugin.instance.require[req.name] = {
						plugin: instances[0],
						plugins: instances
					};
				}
			});
		}
	}

	self = {

		/**
		 */

		'resolve': resolve,
		
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
			return this;
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

		'newPlugin': function(module, options, params, haba) {
			return module.plugin.call(haba, options, params, haba);
		},

		/**
		 */

		'require': function() {

			var newPlugins = Array.apply(null, arguments),
			numLoading = newPlugins.length;

			newPlugins.forEach(function(plugin) {
				for(var i = self.loaders.length; i--;) {
					var loader = self.loaders[i], loaded = false;
					if(loader.test(plugin)) {
						return loader.load(plugin, function(err, module, name, path) {

							if(err) throw err;

							name = module.name || name;


							//already included
							if(included[path]) return console.warn('%s is already loaded', path);


							var instance = self.newPlugin(module, options, params[name] || {}, self) || {};
							plugins[name] = included[path] = {
								instance: instance,
								require: normalizeRequired(module.require),
								path: plugin
							};	

							//onload acts as a foreach-module callback, so asyncronously call query.start so we include the last module
							//ugly as shit.
							if(!loaded && !(--numLoading)) process.nextTick(q.start);

							loaded = true;
						});
					}
				}


				throw new Error('Unable to load plugin ' + plugin);
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
				reg = new RegExp('^' + search + '$');
			} else 
			if(!(search instanceof RegExp)) {
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
					matches.push(plugins[name]);
				}
			}	


			return matches;
		},

		/**
		 */

		'call': function(type) {

			q.add(function(next) {

				initModules();

				var params = Array.apply(null, arguments);
				params.shift();//remove type

				for(var name in plugins) {
					var plugin = plugins[name];
					if(plugin.instance[type]) plugin.instance[type].apply(plugin.instance, params);
				}

				next();
			});
				

			return this;
		},

		/**
		 */

		'init': function() {
			return this.call('init');
		}
	};

	

	return self;
};