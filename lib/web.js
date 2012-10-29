
var plugin = require("./plugin");

module.exports = function() {
	return plugin(arguments, [
		require("./loaders/web/script")
	]);
}

module.exports.BaseLoader = plugin.BaseLoader;