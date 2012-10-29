var path = require("path"),
fs = require("fs"),
async = require("async");

module.exports = require("../base").extend({

	/**
	 */

	"load": function(callback) {
		var dir = this.source, self = this;
		async.forEach(fs.readdirSync(dir), function(file, next) {
			if(file.substr(0, 1) === ".") return next();
			self._loaders.getLoader([dir, file].join("/")).load(next);
		}, callback);
	}
});

module.exports.test = function(source) {
	return (typeof source === "string") && fs.existsSync(source) && fs.statSync(source).isDirectory();
}