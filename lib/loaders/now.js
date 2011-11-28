exports.name = 'dnode loader';

exports.plugin = function() {
	this.loaders.push({
		test: function(path) { 
			return !!path.match(/nowjs\+\w+:\/\//);
		},
		load: function(path, callback) {
			//load dnode
		}
	})
}