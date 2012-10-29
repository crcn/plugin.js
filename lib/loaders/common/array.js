var LoaderCollection = require("../../collections/loaders");

module.exports = require("../base").extend({

	/**
	 */

	"__construct": function() {
		this._super.apply(this, arguments);
		var self = this;
		this._col = new LoaderCollection(this._source.map(function(src) {
			return self._loaders.getLoader(src);
		}));
	},

	/**
	 */

	"load": function(callback) {
		this._col.load(callback);
	}
});

module.exports.test = function(source) {
	return source instanceof Array;
}