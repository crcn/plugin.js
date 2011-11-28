var fglob = require('../');

fglob('/usr/local/README.md /usr/*/README.md', function(files)
{
	console.log(files);
});