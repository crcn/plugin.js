var path = require('path'),
EventEmitter = require('events').EventEmitter,
pluginNameTester = require('./nameTester'),
pluginCollection = require('./collection'),
Structr = require('structr');


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


var includePaths = function(paths, target) {
	paths.forEach(function(fullPath) {
		var normPath = path.normalize(fullPath);

		//no dupes
		if(target.indexOf(normPath) > -1) return;

		target.push(normPath);
	});

	return this;
} 


if(typeof global != 'undefined') global.habaPaths = global.habaPaths || [];


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
	//second param is for debugging - soft-linked haba path breaks node module searching
	paths       = [__dirname], 

	//params specific to each plugin
	params      = {},
	
	//required paths
	required    = [],

	self = {},

	//all plugins
	allPlugins = pluginCollection(self),

	//remote plugins
	remotePlugins = allPlugins.addChild(),

	//local plugins
	localPlugins = allPlugins.addChild(),

	//module paths - check if they've already been loaded
	included    = {},

	//number of modules loading
	numLoading = 0,

	readyListeners = [];

	// em = new EventEmitter();

	var findNodeModulePath = function(path, module) {
		var pathParts = path.split('/'), fullPath;

		while(pathParts.length) {

			if(fullPath = nativeResolve(pathParts.join('/') + '/node_modules/' + module)) return fullPath;

			pathParts.pop();
		}

		return null;
	}


	var resolveFromPaths = function(jsPath, paths) {
		for(var i = paths.length; i--;) {
			var incPath = paths[i];
			if((fullPath = nativeResolve(incPath + '/' + jsPath)) || (fullPath = findNodeModulePath(incPath, jsPath))) return fullPath;
		}

		return null;
	}


	var resolve = function(jsPath) {
		var fullPath;

		if(fullPath = nativeResolve(jsPath)) return fullPath;

		return resolveFromPaths(jsPath, paths) || resolveFromPaths(jsPath, global.habaPaths);
	}

	var tryReadyTimeout = 0;

	function tryReady() {
		numLoading--;

		//debounce
		clearTimeout(tryReadyTimeout);
		tryReadyTimeout = setTimeout(checkReady, 1);
	}

	function checkReady() {
		if(!numLoading)	 process.nextTick(allPlugins.ready);
	}



	Structr.copy({

		/**
		 * resolves a module path
		 */

		'resolve': resolve,
		
		/**
		 * global options passed to all plugins
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
		 * parameters specific to plugins
		 */
		
		'params': function(name, value) {

			if(!arguments.length) return params;

			if(typeof name == 'object') {
				for(var prop in name) {
					self.params(prop, name[prop]);
				} 
			} else {
				params[name] = value;
			}

			return this;
		}, 

		/**
		 * adds / returns paths to scan in
		 */

		'paths': function() {
			if(arguments.length) {
				includePaths(Array.apply(null, arguments), paths);
				return this;
			}

			return paths;
		},

		/**
		 * loads in modules via require
		 */

		'loaders': [],

		/**
		 * all the invokable methods against loaded modules
		 */

		'methods': {},



		/**
		 * factory for loading in modules
		 */

		'newPlugin': function(module, options, params, haba) {
			return module.plugin.call(haba, options, params, haba);
		},

		/**
		 */

		'factory': function(fn) {
			self.newPlugin = fn;
			return self;	
		},

		/**
		 * loads a plugin via loaders
		 */

		'require': function() {

			var newPlugins = Array.prototype.slice.call(arguments, 0);

			if(newPlugins.length > 1) {
				newPlugins.forEach(function(plugin) {
					self.require(plugin);
				});
				return self;
			}

			var plugin = newPlugins[0],
			setNumLoading = false;

			numLoading++;


			for(var i = self.loaders.length; i--;) {
				var loader = self.loaders[i], loaded = false;

				if(loader.test(plugin)) {

					loader.prepare.call(self, plugin, function(err, loadables) {

						if(err) throw err;

						var n = loadables.length;

						numLoading += n;

						tryReady();

						loadables.forEach(function(loadable) {


							loadable.load(function(err, ops) {
								
								if(err) throw err;

								var module = ops.module || {},
								name   = module.name || ops.name,
								path   = ops.path || name,
								remote = ops.remote,
								prm    = params[name] || {};
								prm.name = params.name || name;

								//don't override local
								// if(remote && localPlugins.plugin(name)) return;

								//already included
								if(included[path] && !remote) return console.warn('%s is already loaded', ops.path);
								included[path] = 1;

								var instance = ops.plugin || (self.newPlugin(module, options, prm, self) || {}),
								collection = remote ? remotePlugins : localPlugins;

								collection.add({
									name: name,
									path: path,
									instance: instance,
									require: normalizeRequired(module.require)
								});
									

								readyListeners.forEach(function(listener) {
									
									if(listener.test(name)) {
										listener.callback(instance);
									}
								});


								self.methods[name] = instance;


								tryReady();

							});
						})
					});

					return this;
				}

			}


			throw new Error('Unable to load plugin ' + plugin);
		},


		/**
		 * listener for when a plugin is ready
		 */

		'onLoad': function(search, ret, callback) {

			if(typeof ret == 'function') {
				callback = ret;
				ret = false;
			}

			readyListeners.push({
				test: pluginNameTester(search),
				callback: callback
			});


			if(ret) {
				var plugin = self.plugin(search);

				if(plugin) callback(plugin);
			}
			return this;
		},

		/**
		 */

		'local': localPlugins,

		/**
		 */

		'remote': remotePlugins,

		/**
		 */

		'plugin': allPlugins.plugin,

		/**
		 */

		'plugins': allPlugins.plugins,

		/**
		 */

		'emit': allPlugins.emit,

		/**
		 */

		'next': allPlugins.next, 

		/**
		 */

		'init': function(callback) {
			this.local.emit('init');
			if(callback) self.next(callback);
			return this;
		}
	}, self);

	

	return self;
};


module.exports.paths = function() {
	if(arguments.length) {
		includePaths(Array.apply(null, arguments), includePaths);
	} else {
		return paths;
	}
}