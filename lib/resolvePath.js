var resolve = require("resolve");

module.exports = function(path) {
	return resolve.sync(path, {
		paths: module.exports.paths
	})
}

module.exports.paths = global._pluginPaths || (global._pluginPaths = []);

