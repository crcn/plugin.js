### Plugin Library for node.js

### Motivation

- Modularity - encourages code-reuse, abstraction, and encapsulation
- Easily drop plugin in and out without effecting your program
- Maintainability
- Gives your projects a bit of structure

## Basic Usage

A simple use case with express:

```javascript

var haba = require('haba')(),
server = require('express').createServer();

haba.options(server, true).
require("path/to/plugins/dir");

server.listen(8080);

```

In your `hello world` plugin:

```javascript

exports.plugin = function(server) {
	
	server.get('/', function(req, res) {
		
		res.send("Hello World!");
	});
}

```


## Beans API

### haba.require(path)

requires a given haba

```javascript
plugins.require('path/to/plugin.js').      // require one plugin
require('path/to/plugins/dir').          // require all plugins in directory
require('path/to/plugins/**/*.plugin.js'). // find plugins, and load them
require({							   // include obj
	name: 'my.plugin',
	plugin: function() {
		
	}
}).
require('plugin1.js','plugin2.js','plugin3.js'). //multiple plugin args
require('./package.json'). //load plugins in configuration file { plugins: ['my/plugin.js','...'] }
```

### haba.paths(path)

adds a path to scan when requiring plugins. Similar to the old `require.paths.unshift`

```javascript
haba.paths('/path/to/plugins').require('my-plugin');

console.log(haba.paths());// ['/path/to/plugins','/path/to/node_modules','...'];
```

### haba.params(params)

params specific to plugin - like constructor parameters

bootstrap.js:

```javascript
haba.params({
	'api.server': {
		'port': 8080
	}
}).

//or
params('api.server', { port: 8080 }).
require('api.server');
```

api.server/index.js:

```javascript
exports.plugin = function(ops, params) {
	console.log(params.port); //8080	
}
```


### haba.options(ops)

Adds / returns options which as passed in the first parameter for each plugin.

bootstrap.js:

```javascript
haba.options({ message: 'hello world!' }).require('hello.plugin.js');
```

hello.plugin.js:

```javascript
exports.plugin = function(ops) {
	console.log(ops.message); //hello world!
}
```

### haba.call(method)

Calls a method against all loaded plugins. If the method doesn't exist, it'll be ignored.

bootstrap.js:

```javascript
haba.require('api.server').call("prepare").call("init");
```

api.server/index.js:

```javascript
exports.plugin = function() {
	
	return {
		prepare: function() {
			console.log("PREPARE");	
		},
		init: function() {
			console.log("INIT");
		}
	};
}
```

### haba.init()

Wrapper for `haba.call("init")`


### haba.plugin(search)

Returns a *single* based on the search criteria given

boostrap.js:

```javascript
haba.require('plugin1.js','plugin2.js').init();
```

plugin1.js:

```javascript

exports.plugin = function() {
	
	var haba = this;

	return {
		init: function() {
			haba.plugin('plugin2').sayHello();
		}
	}
}
```

plugin2.js

```javascript

exports.plugin = function() {
	
	return {
		sayHello: function() {
			console.log('hello!');
		}
	}
}
```

## haba.plugins(search)

Returns *multiple* plugins based on the search criteria


## Plugins API


### exports.require

Dependencies for the given haba. This is checked once `haba.call`, or `haba.init` is invoked. An exception is thrown if there are any missing dependencies.

```javascript

exports.require = ['api.services.photos.*','another-plugin']; //requires any photo services. E.g: api.services.photos.facebook, api.services.photos.flickr

exports.require = [/api\.\w+/]; //regexp test

exports.require = function(name) { //function test
	return name.indexOf('api.services.photos') > -1
};


```

You can also load in any given plugin via `exports.require`:

```javascript

exports.require = {
	'myBean' : 'api.services.photos.*'
};


exports.plugin = function() {
	
	return {
		init: function() {
			
			console.log(exports.require.myBean.instance); //return a single instance
			console.log(exports.require.myBean.instances); //return multiple instances 
		}
	}
}
```

### exports.name

Optional name for the plugin. The default value is name provided when requiring the plugin.


### Plugin exports.plugin(options, params)

Called when the plugin is loaded. 

- `options` - options which are passed to the plugin, along with every other plugin.
- `params` - parameters which are specific to the loaded plugin
- return type can be `void`, or an `object`.




 

