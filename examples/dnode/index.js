var haba = require('../../lib')();

haba.require(__dirname+'/client-plugins').
require('dnode+http://localhost:5050').
init().
next(function() {
	console.log("DONE");
});