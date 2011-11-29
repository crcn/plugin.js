var dnode = require('dnode'),
haba = require('../../lib')();

haba.require(__dirname + '/server-plugins').
next(function() {
	dnode(haba.methods).listen(5050);
}).
init();

/*var server = dnode({
	sayHello: function(callback) {
		callback('hello dnode!');
	}
});*/

