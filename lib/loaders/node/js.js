var path = require("path");
module.exports = require("../base").extend({

	/**
	 */

	"load": function(callback) {

		var plugin = require(this.loader.resolver.resolve(this.source));
		plugin.name = path.basename(this.source).replace(/\.js$/, "");
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