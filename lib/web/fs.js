var allFiles = _sardines.allFiles;

exports.isDirectory = function(path) {
	return !path.match(/\.\w+$/);
}

exports.readdirSync = function(path) {

	var parts = path.split('/'),
	cp = allFiles;

	parts.forEach(function(part) {
		cp = cp[part];
	});

	if(!cp) return [];


	return Object.keys(cp);
}


exports.realpathSync = function(path) {
	return path;
}
