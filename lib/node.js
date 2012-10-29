
var plugin = require("./plugin");

module.exports = function() {
	return plugin(arguments, [
		require("./loaders/node/directory"),
		require("./loaders/node/js")
	]);
}

module.exports.BaseLoader = plugin.BaseLoader;