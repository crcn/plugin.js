exports.plugin = function() {
	var haba = this;
	haba.authorize = function(user, pass) {
		return !haba.credentials || (haba.credentials.user == user && haba.credentials.pass == pass);
	}
}