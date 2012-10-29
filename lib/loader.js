var structr  = require("structr"),
dref         = require("dref"),
EventEmitter = require("events").EventEmitter,
resolvePath  = require("./resolvePath"),
async        = require("async"),
LoaderFactory    = require("./loaders"),
LoaderCollection = require("./collections/loaders"),
PluginCollection = require("./collections/plugins");

module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(plugInto) {
		this._params        = {};
		this._loaders       = new LoaderCollection();
		this._plugins       = new PluginCollection(plugInto, this);
		this.loaderFactory  = new LoaderFactory(this._plugins);
	},

	/**
	 * returns params, or sets params. Note that you can
	 * deeply reference a param - this helps avoid null exceptions
	 */

	"params": function(keyOrParams, value) {
		if(!arguments.length) return this._params;
		if(arguments.length === 1) {
			if(typeof keyOrParams === "object") {
				for(var key in keyOrParams) {
					this.params(key, keyOrParams[key]);
				}
				return this;
			}
			return dref.get(this._params, keyOrParams);
		}
		dref.set(this._params, keyOrParams, value);
		return this;
	},

	/**
	 * extend onto this loader. Useful for doing stuff like adding
	 * custom loaders e.g dnode
	 */

	"use": function(extension) {
		extension(this);
	},

	/**
	 * adds plugins to be loaded in on .load()
	 */

	"require": function() {
		var req = this._loaders, self = this;
		Array.prototype.slice.call(arguments, 0).forEach(function(dep) {
			req.add(self.loaderFactory.getLoader(dep));
		});
		return this;
	},

	/**
	 * return one plugin
	 */

	"module": function(search) {
		return this._plugins.module(search);
	},

	/**
	 * return multiple plugins, OR loads based on the search. This is similar to 
	 * require, but it's immediate. 
	 */

	"modules": function(search) {
		return this._plugins.modules(search);
	},

	/**
	 */

	"load": function(onLoad) {

		if(onLoad) {
			this.once("loaded", onLoad);
		}

		//cannot reload.
		if(this._loading) return;
		this._loading = true;

		var self = this;

		//first load in the sources where the plugins live - need to unravel shit
		this._loaders.load(function() {

			//finally, load the plugins - this should be instant.
			self._plugins.load(function() {

				//apply this exports to this loader, and finish!
				self.exports = self._plugins.exports;

				//notify any listeners
				self.emit("loaded", null, self.exports);
			})
		});
	}
});

exports.paths =  resolvePath.paths;