exports.plugin = function() {
	this.remote = function() {
		console.log("GOLD");
		return 'dnode';
	}	
};