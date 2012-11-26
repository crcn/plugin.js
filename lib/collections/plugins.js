var structr = require("structr"),
sift        = require("sift"),
_ = require("underscore");


var PluginLoader = structr({

	/**
	 */

	"__construct": function(collection, plugin) {
		this.collection = collection;
		if(plugin) this.plugin(plugin);
	},

	/**
	 */

	"plugin": function(plugin) {
		if(!arguments.length) return this._plugin;
		var reload = false;
		if(!!this.module) reload = true;
		this._plugin = plugin;
		this.module  = null;
		this._copyPluginAttrs();
		if(reload) this.load();
	},

	/**
	 */

	"dispose": function() {
		if(this.plugin.unplug) this.plugin.unplug();
		delete this.collection.exports[this.name];
	},

	/**
	 */

	"load": function() {
		if(!!this.module) return this.module;

		var args = [], 
		_deps = this._plugin._deps || [];
		self = this;

		var deps = _deps.map(function(dep) {
			var modules = [];
			dep.names.map(function(name) {
				modules = modules.concat(self.collection.modules(name));
			});
			if(dep.multi) {
				return modules;
			} else {
				return modules.pop();
			}
		});

		args = args.concat(deps).
		concat(this.collection.plugInto).
		concat(this.collection.loader);
		

		return this.collection.exports[this.name] = this.module = this._plugin.plugin.apply(this._plugin, args) || { };
	},

	/**
	 */

	"_copyPluginAttrs": function() {
		for(var property in this._plugin) {
			var v = this._plugin[property];
			if((typeof v == "function") || !!this[property]) continue;
			this[property] = v;
		}
	}
});

module.exports = structr({

	/**
	 */

	"__construct": function(plugInto, loader) {

		//plugins that have yet to be loaded
		this._pluginLoaders = [];

		//item to plugin into
		this.plugInto = plugInto;

		//loader which glues everything together
		this.loader   = loader;

		//all the modules combined
		this.exports = {};
	},

	/**
	 */

	"add": function(plugin) {

		//exists?
		var pluginLoader = this._findPluginLoaderByName(plugin.name);

		if(!pluginLoader) {
			pluginLoader = new PluginLoader(this);
			this._pluginLoaders.push(pluginLoader);
		}

		pluginLoader.plugin(plugin);
	},

	/**
	 */

	"remove": function(pluginName) {
		var pluginLoader = this._findPluginLoaderByName(pluginName);
		if(!pluginLoader) return;
		pluginLoader.dispose();
		var i = this._pluginLoaders.indexOf(pluginLoader);
		if(~i) this._pluginLoaders.splice(i, 1);
	},

	/**
	 */

	"module": function(name) {
		var module = this.modules(name).pop();
		if(!module) {
			throw new Error("module '"+name+"' does not exist");
		}
		return module;
	},

	/**
	 */

	"modules": function(q) {
		return sift(this._query(q), this._pluginLoaders).map(function(pluginLoader) {
			if(!pluginLoader.module) pluginLoader.load();
			return pluginLoader.module;
		});
	},

	/**
	 */

	"load": function(callback) {
		var self = this;

		for(var i = 0, n = this._pluginLoaders.length; i < n; i++) {
			var loader = this._pluginLoaders[i];
			try {
				loader.load();
			} catch(e) {
				return callback(e);
			}
		}

		callback();
	},

	/**
	 */

	"_findPluginLoaderByName": function(name) {
		return _.find(this._pluginLoaders, function(pluginLoader) {
			return pluginLoader.name == name;
		});
	},

	/**
	 */

	"_query": function(q) {

		var query = q;

		if(typeof q == "string") {
			q = new RegExp("^" + q + "$");
		}

		if(q instanceof RegExp) {
			query = { name: q };
		}

		return query;
	}
	
});