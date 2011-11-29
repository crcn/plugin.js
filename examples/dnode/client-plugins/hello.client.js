exports.require = 'hello.dnode';

exports.plugin = function(ops, params) {
	return {
		init: function() {
			this.require['hello.dnode'].plugin.sayHello(function(response) {
				console.log(response)
			});
		}
	}
}