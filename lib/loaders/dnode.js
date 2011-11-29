var dnode = require('dnode'),
Url = require('url');

exports.name = 'dnode';

exports.plugin = function() {

	var haba = this;

	this.loaders.push({
		test: function(path) { 
			return !!path.match(/dnode\+\w+:\/\//);
		},
		load: function(path, callback) {

			var host = Url.parse(path.replace('dnode+',''));

			dnode.connect({ host: host.hostname, port: host.port }, function(remote) {

				remote['dnode-getPlugins'](function(plugins) {
					for(var name in plugins) {
						callback(false, { plugin: plugins[name], name: name });
					}
				});
			});
		}
	});


	var self = {
		'dnode-getPlugins': function(callback) {

			var plugins = haba.plugins(),
			hooks = {};

			for(var name in plugins) {
				hooks[name] = plugins[name].instance;	
			}

			callback(hooks);
		}
	};

	return self;
}