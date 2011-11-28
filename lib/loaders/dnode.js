exports.name = 'dnode loader';

exports.plugin = function() {
	this.loaders.push({
		test: function(path) { 
			return !!path.match(/dnode\+\w+:\/\//);
		},
		load: function(path, callback) {
			//load dnode
			console.log('loading dnode plugins: %s', path);
		}
	})
}