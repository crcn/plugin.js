var dnode = require('dnode'),
Url = require('url');

exports.require = ['authorize'];

exports.plugin = function() {

	var haba = this;


	this.loaders.push({
		test: function(path) { 
			return !!path.match(/dnode\+\w+:\/\//);
		},
		load: function(path, callback) {

			var host = Url.parse(path.replace('dnode+',''));

			var client = dnode.connect({ host: host.hostname, port: host.port, reconnect: 2000 }, function(remote) {

				function onAuth(methods) {
					if(!methods) throw new Error('Invalid authentication credentials for dnode server: ' + host.hostname + ':' + host.port);

					for(var name in methods) {

						var plugin = methods[name];
						plugin.__remote = true;

						// var existingPlugin = haba.plugin(name);

						/*if(existingPlugin && !existingPlugin.__remote) {
							continue;
						}*/

						callback(false, { plugin: methods[name], name: name, remote: true });
					}
				}

				var auth = (host.auth || '').split(':');

				remote.authorize(auth[0], auth[1], onAuth);
			});

			client.on('reconnect', function() {
				console.log("DISCONNECT");
			})
		}
	});


	return {
		authorize: function(user, pass, callback) {
			if(haba.authorize(user, pass)) {
				callback(haba.methods);
			} else {
				callback(null);
			}
		}
	}
}