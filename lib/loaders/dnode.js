var dnode = require('dnode'),
Url = require('url');

exports.plugin = function() {

	var haba = this;

	this.loaders.push({
		test: function(path) { 
			return !!path.match(/dnode\+\w+:\/\//);
		},
		load: function(path, callback) {

			var host = Url.parse(path.replace('dnode+',''));

			dnode.connect({ host: host.hostname, port: host.port }, function(remote) {

				for(var name in remote) {
					callback(false, { plugin: remote[name], name: name });
				}
			});
		}
	});

}