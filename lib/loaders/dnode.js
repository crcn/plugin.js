var dnode = require('dnode'),
Url = require('url');

exports.name = 'dnode';

exports.plugin = function() {



	this.loaders.push({
		test: function(path) { 
			return !!path.match(/dnode\+\w+:\/\//);
		},
		load: function(path, callback) {

			var host = Url.parse(path.replace('dnode+',''));

			dnode.connect({ host: host.hostname, port: host.port }, function(remote) {

				remote['dnode-getPlugins'](function(plugins) {
					console.log(plugins)
				});
			});
		}
	});


	return {
		'dnode-call': function() {
		},
		'dnode-getPlugins': function() {
			
		}
	};
}