 var core = require('./core'),
fs = require('fs'),
path = require('path');


var fileExists = function(file) {
	try {
		fs.lstatSync(file);
		return true;
	} catch(e) {
		return false;
	}
}

//deprecated.
module.exports = function(plugInto) {

	var plugin = core(plugInto);


	var loadJsFile = {
		test: function(jsPath) {
			return plugin.resolve(jsPath);
		},
		prepare: function(jsPath, name, callback) {

			if(typeof name == 'function') {
				callback = name;
				name = undefined;
			}

			var ret = {
				load: function(callback) {
					fullPath = plugin.resolve(jsPath); //yeah, more overhead >.>


					if(!fullPath) throw new Error(jsPath + ' does not exist');

					if(!name) name = path.basename(jsPath).replace('.js','');

					function onLoad(module) {
						callback(false, { module: module, name: name, path: fullPath });
					}

					var module = require(fullPath);

					if(module.load) {
						module.load(onLoad);
					} else {
						onLoad(module);
					}
				}
			};

			if(callback) callback(false, [ret]);

			return ret;
		}
	}

	/**
	 * scans a directory
	 */

	var loadDirectory = {
		test: function(dir) {
			return fileExists(dir) && fs.statSync(dir).isDirectory();
		},
		prepare: function(dir, callback) {
			var files = fs.readdirSync(dir),
			loadable = [];

			files.forEach(function(basename, i) {

				if(basename.substr(0,1) == '.') return;

				loadable.push(loadJsFile.prepare(dir + '/' + basename));
			});

			callback(false, loadable);
		}
	}

	/**
	 */

	var loadConfig = {
		test: function(pkgPath) {
			return typeof pkgPath == 'object' || (typeof pkgPath == 'string' && pkgPath.match(/json$/));
		},
		prepare: function(pkgPath, callback) {
			var plugins = typeof pkgPath == 'object' ? pkgPath : JSON.parse(fs.readFileSync(pkgPath,'utf8')).plugins, 
			loadable = [],
			params = this.params();


			for(var name in plugins) {
				var par = plugins[name];

				//param values for the given plugin
				if(typeof par == 'object') params[name] = par;

				loadable.push(loadJsFile.prepare(name, name));
			}

			callback(false, loadable);
		}
	}

	/**
	 * recursively load directories
	 */

	var findModules = function(search, cwd, modules) {
		if(!modules) modules = [];

		fs.readdirSync(cwd).forEach(function(basename) {
			var fullPath = cwd + '/' + basename;
			if(fs.isDirectory(fullPath)) {
				findModules(search, fullPath, modules);
			} else 
			if(fullPath.match(search)) {
				modules.push(fs.realpathSync(fullPath));
			}
		});

		return modules;
	}

	var loadTree = {
		test: function(dir) {
			return String(dir).indexOf('**') > -1
		},
		prepare: function(dir, callback) {

			var dirParts = dir.split('**'),
			cwd          = dirParts.shift(), 
			search = new RegExp(""+dir.replace('.','\\.').replace('**','.*').replace('/*/','/[^\/]+/')+"")
			var files = findModules(search, cwd),
			loadable = [];

			files.forEach(function(file, i) {
				loadable.push(loadJsFile.prepare(file, path.basename(file)));
			});

			

			if(callback) callback(false, loadable);
		}
	}


	//setup the core loaders
	plugin.loaders = [loadConfig, loadJsFile, loadDirectory, loadTree].reverse();

	return plugin;
};

module.exports.loader = module.exports;
module.exports.paths  = core.paths;