var outcome = require("outcome");

module.exports = require("../base").extend({

	/**
	 */

	"load": function(callback) {

		var self = this,
		onPlugin = outcome.error(callback).success(function(plugin) {
			self._plugins.add(plugin);
			callback();
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