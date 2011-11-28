exports.require = {
	hello2: 'hello2'
};

exports.plugin = function() {
	return {
		init: function() {
			this.require.hello2.plugin.sayHello();
		}
	};
}