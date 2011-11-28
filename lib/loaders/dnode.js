exports.name = 'dnode loader';

exports.plugin = function() {
	this.loaders.push({
		test: function(path) { 
			return !!path.match(/dnode\+\w+:\/\//);
		},
		load: function(path, callback) {
			//load dnode
			callback(new Error('not implemented yet'));
		}
	})
}