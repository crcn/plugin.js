var Loader = require("./loader");

module.exports = function(args, loaders) {

	loaders.unshift(
		require("./loaders/common/array"),
		require("./loaders/common/object")
	);

	return new Loader(Array.prototype.slice.call(args, 0), loaders);
}

module.exports.BaseLoader = require("./loaders/base");