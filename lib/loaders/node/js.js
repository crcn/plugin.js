var path = require("path");
module.exports = require("../base").extend({

	/**
	 */

	"load": function(callback) {

		var plugin = require(this.source);
		plugin.name = path.basename(this.source).replace(/\.js$/, "");
		this._loaders.getLoader(plugin).load(callback);
	}
});

module.exports.test = function(source) {
	try {
		return (typeof source === "string") && require.resolve(source);
	} catch(e) {
		return false;
	}
}