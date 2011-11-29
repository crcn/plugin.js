var dnode = require('dnode'),
haba = require('../../lib')();

haba.require(__dirname + '/server-plugins').
init(function() {
	dnode(haba.methods).listen(5050);
});

/*var server = dnode({
	sayHello: function(callback) {
		callback('hello dnode!');
	}
});*/

