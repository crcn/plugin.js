 var core = require('./core'),
fs = require('fs'),
path = require('path');



var fileExists = function(file) {
	try {
		fs.statSync(file);
		return true;
	} catch (e) {
		return false;
	}
}

module.exports = function() {
	
	var haba = core();

		
	var loadJsFile = {
		test: function(jsPath) {
			return haba.resolve(jsPath);
		},
		load: function(jsPath, callback, name, index, count) {
			fullPath = haba.resolve(jsPath); //yeah, more overhead >.>

			if(!name) name = path.basename(jsPath).replace('.js','');

			function onLoad(module) {
				callback(false, { module: module, name: name, path: fullPath, index: index == undefined ? 1 : index, length: count || 1 });
			}

			var module = require(fullPath);

			if(module.load) {
				module.load(onLoad);
			} else {
				onLoad(module);
			}
		}
	}

	/**
	 * scans a directory
	 */

	var loadDirectory = {
		test: function(dir) {
			return fileExists(dir) && fs.statSync(dir).isDirectory();
		},
		load: function(dir, callback) {
			var files = fs.readdirSync(dir);

			files.forEach(function(basename, i) {
				
				if(basename.substr(0,1) == '.') return;
					
				loadJsFile.load(dir + '/' + basename, callback, null, i, files.length);
			})
		}
	}

	/**
	 */

	var loadConfig = {
		test: function(pkgPath) {
			return typeof pkgPath == 'string' && pkgPath.match(/json$/);
		},
		load: function(pkgPath, callback) {
			var plugins = JSON.parse(fs.readFileSync(pkgPath,'utf8')).plugins, 
			n = Object.keys(plugins).length,
			i = 0;

			for(var name in plugins) {
				var par = plugins[name];

				//param values for the given plugin
				if(typeof par == 'object') params[name] = par;

				loadJsFile.load(name, callback, name, i++, files.length);
			}
		}
	}

	/**
	 * recursively load directories
	 */

	var findModules = function(search, cwd, modules) {
		if(!modules) modules = [];

		fs.readdirSync(cwd).forEach(function(basename) {
			var fullPath = cwd + '/' + basename;
			if(fs.statSync(fullPath).isDirectory()) {
				findModules(search, fullPath, modules);
			} else 
			if(basename.match(search)) {
				modules.push(fs.realpathSync(fullPath));
			}
		});

		return modules;
	}

	var loadTree = {
		test: function(dir) {
			return dir.indexOf('**') > -1
		},
		load: function(dir, callback) {
			var dirParts = dir.split('**'),
			cwd          = dirParts.shift(), 
			search       = new RegExp('^'+dirParts.pop().split('/').pop().replace(/\./g,'\\.').replace(/\*/g,'.*?') + '$');

			var files = findModules(search, cwd);


			files.forEach(function(file, i) {
				loadJsFile.load(file, callback, null, i, files.length);	
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

	//setup the core loaders
	haba.loaders = [loadJsFile, loadConfig, loadDirectory, loadTree, loadObj];


	//now that all the core loaders are in, we can add the additional loaders dropped in ./loaders (cleaner)
	haba.require( __dirname + '/plugins');
	

	return haba;
};

module.exports.loader = module.exports;