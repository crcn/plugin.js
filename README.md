### Plugin.js

#### All your module loading in one place.

### Example

bootstrap.js

```javascript

var plugin = require("plugin"),
express    = require("express");

//plug into the express server
var loader = plugin(express()).
params({
	http: {
		port: 8080
	}
}).
require(__dirname + "/config.js").
require(__dirname + "/someRoutes.js").
load();

```

config.js

```javascript
module.exports = function(server, loader) {
	server.listen(loader.params("http.port") || 80);
}
```

someRoutes.js

```javascript
module.exports = function(server) {
	server.get("/hello", function(req, res) {
		res.end("world!");
	})
}
```

### Plugin API

#### loader .plugin(plugInto)

this is the first parameter when loading each plugin. See the express example above.

#### loader.require(path)

the path to the plugins.

```javascript
plugins.require('path/to/plugin.js').      // require one plugin
require('path/to/plugins/dir').          // require all plugins in directory
require('path/to/plugins/**/*.plugin.js'). // find plugins, and load them
require('plugin1.js','plugin2.js','plugin3.js'). //multiple plugin args
require('./config.json').load(); //load plugins in configuration file { plugins: ['my/plugin.js','...'] }
```


#### loader.load(callback)

Loads all the plugins.

- `callback` - called once all plugins are loaded

#### loader.paths(path)

adds a path to scan when requiring plugins. Similar to the old `require.paths.unshift`

#### loader.params(param, value)

Getter / setter for global parameters. 

```javascript
var loader = plugin().
params({
	"http.port": 80,
	"person": {
		"name": "craig"
	}
}).
params("secret", "password");


console.log(loader.params("http")); //{ port: 80 }
console.log(loader.params("http.port")); // 80
console.log(loader.params("person")); // { name: "craig" }
console.log(loader.params("secret")); // password
```

#### loader.plugins(search)

Returns loaded plugins based on the search query given

```javascript
var loader = require("plugin")();

loader.require('oauth.part.twitter','oauth.part.facebook','oauth.core').
load(function() {
    loader.plugins(/^oauth.part.\w+$/).forEach(function(service) {

        //do stuff with the oauth plugins

    });
});
```

#### loader.exports

aggregation of all the returned objects from each plugin.


## Plugins API


### exports.require

Dependencies for the given plugin. This is checked once `plugin.call`, or `plugin.load` is invoked. An exception is thrown if there are any missing dependencies.

```javascript

exports.require = ['api.services.photos.*','another-plugin']; //requires any photo services. E.g: api.services.photos.facebook, api.services.photos.flickr

exports.require = [/api\.\w+/]; //regexp test

exports.require = function(name) { //function test
	return name.indexOf('api.services.photos') > -1
};


```

You can also load in any given plugin via `exports.require`:

```javascript

exports.require = 'my-plugin';

exports.plugin = function() {
	
	var plugin = this;

	return {
		init: function() {
			
			plugin.plugin('my-plugin').doStuff();//return a single instance
			plugin.plugins('my-plugin').forEach(funtion(plugin) {//return multiple instances
				plugin.doStuff();
			});
		}
	}
}
```

### exports.name

Optional name for the plugin. The default value is name provided when requiring the plugin.

### Plugin exports.plugin(plugInto, loader)

Called when the plugin is loaded. 

- `plugInto` - options which are passed to the plugin, along with every other plugin.
- `loader` - the plugin loader. Also accessible via `this`.
- return type can be `void`, or an `object`.







