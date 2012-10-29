var structr = require("structr"),
sift        = require("sift");


var PluginLoader = structr({

	/**
	 */

	"__construct": function(collection, plugin) {
		this.plugin = plugin;
		this.collection = collection;
		this._copyPluginAttrs();
	},

	/**
	 */

	"load": function() {
		if(this.loaded) return this.module;
		this.loaded = true;

		var args = this.collection.plugInto.concat(this.collection.loader);
		return this.module = this.plugin.plugin.apply(this.plugin, args);
	},

	/**
	 */

	"_copyPluginAttrs": function() {
		for(var property in this.plugin) {
			var v = this.plugin[property];
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
		this._pluginLoaders.push(new PluginLoader(this, plugin));
	},

	/**
	 */

	"module": function(name) {
		return this.modules(name).pop();
	},

	/**
	 */

	"modules": function(q) {
		return sift(this._query(q), this._pluginLoaders).map(function(pluginLoader) {
			if(!pluginLoader.loaded) pluginLoader.load();
			return pluginLoader.module;
		});
	},

	/**
	 */

	"load": function(callback) {
		var self = this;
		this._pluginLoaders.forEach(function(pluginLoader) {
			self.exports[pluginLoader.name] = pluginLoader.load();
		});
		callback();
	},

	/**
	 */

	"_query": function(q) {

		var query = q;

		if(typeof q == "string") {
			q = new RegExp(q);
		}

		if(q instanceof RegExp) {
			query = { name: q };
		}

		return query;
	}
	
});