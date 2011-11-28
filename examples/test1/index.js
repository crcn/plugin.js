var haba = require('../../lib')();

haba.paths(__dirname + '/plugins').
require('hello1','hello2').
init(); 
