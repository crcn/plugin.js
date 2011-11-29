var haba = require('../../lib')();

haba.require('dnode+http://localhost:5050').
init().
next(function() {
	console.log("DONE");
});