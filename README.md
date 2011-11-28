### Plugin Library for node.js

### Motivation

- Modularity - encourages code-reuse, abstraction, and encapsulation
- Easily drop "bean" in and out without effecting your program
- Maintainability
- Gives your projects a bit of structure

## Basic Usage

A simple use case with express:

```javascript

var bean = require('bean'),
server = require('express').createServer();

bean.options(server).
require("path/to/beans/dir");

server.listen(8080);

```

In your `hello world` bean:

```javascript

exports.plugin = function(server) {
	
	server.get('/', function(req, res) {
		
		res.send("Hello World!");
	});
}

```


## Beans API

### bean.require(path)

requires a given bean

```javascript
beans.require('path/to/bean.js').      // require one bean
require('path/to/beans/dir').          // require all beans in directory
require('path/to/beans/**/*.bean.js'). // find beans, and load them
require({							   // include obj
	name: 'my.bean',
	plugin: function() {
		
	}
}).
require('bean1.js','bean2.js','bean3.js'). //multiple bean args
require('./package.json'). //load beans in configuration file { beans: ['my/bean.js','...'] }
```

### bean.paths(path)

adds a path to scan when requiring beans. Similar to the old `require.paths.unshift`

```javascript
bean.paths('/path/to/beans').require('my-bean');

console.log(bean.paths());// ['/path/to/beans','/path/to/node_modules','...'];
```

### bean.params(params)

params specific to bean - like constructor parameters

bootstrap.js:

```javascript
bean.params({
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


### bean.options(ops)

Adds / returns options which as passed in the first parameter for each plugin.

bootstrap.js:

```javascript
bean.options({ message: 'hello world!' }).require('hello.plugin.js');
```

hello.plugin.js:

```javascript
exports.plugin = function(ops) {
	console.log(ops.message); //hello world!
}
```

### bean.call(method)

Calls a method against all loaded beans. If the method doesn't exist, it'll be ignored.

bootstrap.js:

```javascript
bean.require('api.server').call("prepare").call("init");
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

### bean.init()

Wrapper for `bean.call("init")`


### bean.plugin(search)

Returns a *single* based on the search criteria given

boostrap.js:

```javascript
bean.require('bean1.js','bean2.js').init();
```

bean1.js:

```javascript

exports.plugin = function() {
	
	var bean = this;

	return {
		init: function() {
			bean.plugin('bean2').sayHello();
		}
	}
}
```

bean2.js

```javascript

exports.plugin = function() {
	
	return {
		sayHello: function() {
			console.log('hello!');
		}
	}
}
```

## bean.plugins(search)

Returns *multiple* plugins based on the search criteria


## Plugins API


### exports.require

Dependencies for the given bean. This is checked once `bean.call`, or `bean.init` is invoked. An exception is thrown if there are any missing dependencies.

```javascript

exports.require = ['api.services.photos.*','another-bean']; //requires any photo services. E.g: api.services.photos.facebook, api.services.photos.flickr

exports.require = [/api\.\w+/]; //regexp test

exports.require = function(name) { //function test
	return name.indexOf('api.services.photos') > -1
};


```

You can also load in any given bean via `exports.require`:

```javascript

exports.require = {
	'myBean' : 'api.services.photos.*'
};


exports.plugin = function() {
	
	return {
		init: function() {
			
			console.log(exports.require.myBean.instance()); //return a single instance
			console.log(exports.require.myBean.instances()); //return multiple instances 
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




 

