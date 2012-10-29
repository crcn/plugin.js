var Loader = require("./loader");

module.exports = function() {
	return new Loader(Array.prototype.slice.call(arguments, 0));
}