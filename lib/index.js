var path = require('path');

var copy = function(from, to) {
	if(!to) to = {};

	for(var i in from) to[i] = from[i];

	return to;
}

var fileExists = function(file) {
	try {
		fs.statSync(file);
		return true;
	} catch (e) {
		return false;
	}
}

var nativeResolve = function(file) {
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
	paths       = [],

	//params specific to each plugin
	params 		= {},
	
	//required paths
	required 	= [],

	//loaded plugins
	plugins 	= {},

	initialized = false;


	var resolve = function(jsPath) {
		var fullPath;
		
		if(fullPath = nativeResolve(jsPath)) return fullPath;

		for(var incPath in paths) {
			if(fullPath = nativeResolve(incPath + '/' + jsPath)) return fullPath;
		}
	}

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

			return this;
		},

		/**
		 */

		'init': function() {
			return this.call('init');
		}
	};

	//node.js
	if(typeof window == 'undefined') {
		var fs = require('fs'),
		fglob  = require('fglob');
		
		var loadJsFile = {
			test: function(jSPath) {
				return resolve(jSPath);
			},
			load: function(jSPath, callback, name) {
				jSPath = resolve(path); //yeah, more overhead >.>
				
				if(!name) name = path.basename(path.dirname(jsPath));

				callback(require(path), name);
			}
		}

		/**
		 * scans a directory
		 */

		var loadDirectory = {
			test: function(dir) {
				return fileExists(path) && fs.statSync(dir).isDirectory();
			},
			load: function(dir, callback) {
				fs.readdirSync(dir).forEach(function(basename) {
					loadJsFile.load(dir + '/' + basename, callback, basename);
				});
			}
		}

		/**
		 */

		var loadConfig = {
			test: function(pkgPath) {
				return typeof pkgPath == 'string' && pkgPath.match(/json$/);
			},
			load: function(pkgPath, callback) {
				var plugins = JSON.parse(fs.readFileSync(pkgPath,'utf8')).plugins;

				for(var name in plugins) {
					var par = plugins[name];

					//param values for the given plugin
					if(typeof par == 'object') params[name] = par;

					loadJsFile.load(name, callback, name)
				}
			}
		}

		/**
		 * recursively load directories
		 */

		var loadTree = {
			test: function(dir) {
				return dir.indexOf('**') > -1
			},
			load: function(dir, callback) {
				var dirParts = dir.split('**'),
				cwd 	     = dirParts.shift(), 
				scanDir 	 = dirParts.pop().substr(1); //remove root /

				fglob(scanDir, { cwd: cwd }, function(files) {
					files.forEach(function(file) {
						loadJsFile.load(file, callback, path.basename(file).split('.').shift());	
					});
				});
			}
		}

		/**
		 */

		var loadObj = {
			test: function(obj) {
				return typeof obj == 'object';
			},
			load: function(obj, callback) {
				callback(obj, obj.name);
			}
		}

		self.loaders = [loadJsFile, loadConfig, loadDirectory, loadTree, loadObj];
	
	//online
	} else {
		//todo
	}

	return self;
};