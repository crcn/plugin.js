var dnode = require('dnode'),
haba = require('../../lib')();

haba.require(__dirname + '/server-plugins').
next(function() {
	dnode(haba.plugin('dnode')).listen(5050);
});

/*var server = dnode({
	sayHello: function(callback) {
		callback('hello dnode!');
	}
});*/
