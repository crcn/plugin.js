var _ = require("underscore"),
structr = require("structr");

exports = module.exports = structr({

	/**
	 */

	"__construct": function(plugins) {
		this._plugins = plugins;
		this._loaders = [
			require("./array"),
			require("./object"),
			require("./directory"),
			require("./js")
		];
		this._sortLoaders();
	},

	/**
	 */

	"addLoaderClass": function(loaderClass) {
		this._loaders.push(loaderClass);
	},

	/**
	 */

	"getLoader": function(source) {
		var clazz = _.find(this._loaders, function(loader) {
			return loader.test(source);
		});

		if(!clazz) {
			throw new Error("unable to find plugin loader for \"" + source + "\".");
		}

		return new clazz(source, this, this._plugins);
	},

	/**
	 */

	"_sortLoaders": function() {
		this._loaders.sort(function(a, b) {
			return a.priority > b.priority ? -1 : 1;
		});	
	}
});
