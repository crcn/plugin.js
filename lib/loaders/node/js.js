var path = require("path"),
_count   = 0;

module.exports = require("../base").extend({

	/**
	 */

	"load": function(callback) {
		var realpath = this.loader.resolver.resolve(this.source),
		plugin       = require(realpath),
		basename     = path.basename(realpath),
		dirname      = path.dirname(realpath);

		if(!plugin.name) plugin.name  = basename == "index.js" ? path.basename(this.source).replace(/\.js$/, "") : String("_module" + (_count++));
		if(plugin.require) {
			plugin.require = plugin.require.map(function(deps) {

				function fixDep(dep) {
					return dep.replace(/^\./, dirname);
				}

				if(!(deps instanceof Array)) return fixDep(deps);
				return deps.map(function(dep) {
					return dep.replace(/^\./, dirname);
				});
			});
		}
		plugin.path  = realpath;
		this._loaders.getLoader(plugin).load(callback);
	}
});

module.exports.test = function(source, loader) {
	try {
		return (typeof source === "string") && loader.resolver.resolve(source);
	} catch(e) {
		return false;
	}
}