var fs = require('fs');


function match(paths, cwd, files, statd)
{
	if(!files) files = [];
	
	if(!paths.length)
	{
		try
		{
			//throws error if file does not exist
			if(!statd) fs.statSync(cwd);
			
			files[cwd.substr(1)] = 1;
		}
		catch(e)
		{
			
		}
		return;
	}
	
	
	var path = paths.shift();
	
	
	if(path.indexOf('*') > -1)
	{
		var regex = new RegExp('^'+path.replace(/\./g,'\\.').replace(/\*/g,'.*?') + '$');

		try 
		{

			var stat = fs.statSync(cwd);
		}
		catch(e)
		{
			return;
		}

		if(stat.isDirectory())
		{
			fs.readdirSync(cwd).forEach(function(file)
			{
				if(regex.test(file))
				{
					match(paths.concat(), cwd + '/' + file, files, true);
				}
			});
		}
	}
	else
	{
		cwd += '/' + path;
		
		return match(paths.concat(), cwd, files);
	}
	
	return;
}
 
module.exports = function(includes, ops, callback)
{
	if(!callback)
	{
		callback = ops;
		ops = {
			cwd: process.cwd()
		}
	}
	
	var search = includes.split(/[\s,]+/g),
	numSearching = search.length,
	allFiles = {};
	
	search.forEach(function(path)
	{
		path = path.replace(/~/g, process.env.HOME);
		
		if(path.substr(0,1) != '/') path = ops.cwd + '/' + path; 
		
		var paths = path.split('/');
		
		paths.shift();
		
		
		match(paths, '/', allFiles);
	});
	
	var ar = [];
	
	for(var file in allFiles)
	{
		ar.push(file);
	}
	
	callback(ar);
}