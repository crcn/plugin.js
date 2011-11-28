exports.name = 'dnode loader';

exports.plugin = function() {
	this.loaders.push({
		test: function(path) { 
			return !!path.match(/beanpoll\+\w+:\/\//);
		},
		load: function(path, callback) {
			//load dnode
		}
	})
}