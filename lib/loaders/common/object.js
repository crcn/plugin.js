var outcome = require("outcome"),
async       = require("async");

module.exports = require("../base").extend({

	/**
	 */

	"load": function(callback) {

		var self = this,
		onPlugin = outcome.error(callback).success(function(plugin) {

			var req = plugin.require ? (plugin.require instanceof Array ? plugin.require : [plugin.require]) : [];

			async.forEach(req, function(dep, next) {
				self._loaders.getLoader(dep).load(next);
			}, function() {
				self._plugins.add(plugin);
				callback();
			})
		});
		
		if(this.source.load) {
			this.source.load(onPlugin);
		} else {
			onPlugin(null, this.source);
		}
	}
});

module.exports.test = function(source) {
	return typeof source === "object" && !(source instanceof Array);
}