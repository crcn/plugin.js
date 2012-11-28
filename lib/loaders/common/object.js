var outcome = require("outcome"),
async       = require("async");

module.exports = require("../base").extend({

	/**
	 */

	"load": function(callback) {

		var self = this,
		onPlugin = outcome.error(callback).success(function(plugin) {
				
			//format: required = [__dirname + "/somePath", "someModule", ["search.*"]]
			//where anything wrapped in an array tells the plugin loader that module needs an array in the given param
			if(!plugin.require) plugin.require = [];
			var req = plugin.require instanceof Array ? plugin.require : [plugin.require];

			//the actual loaded plugins
			plugin._deps = [];


			//load each required item if we can
			async.map(req, function(depsOrPluginNames, next) {


				var multi = depsOrPluginNames instanceof Array,
				dopns = multi ? depsOrPluginNames : [depsOrPluginNames];

				//if the dep is embedded in an array, then each of the embedded deps will be concatenated
				//in the end
				async.map(dopns, function(depOrPluginName, next) {
					//dep? it'll load
					try {
						
						self._loaders.getLoader(depOrPluginName).load(outcome.error(next).success(function(pgn) {
							var plugins = pgn instanceof Array ? pgn : [pgn];

							next(null, plugins.map(function(plugin) {
								return plugin.name;
							}));
						}));

					//otherwise it's a plugin name
					} catch(e) {
						//TODO - emit("warning", e)
						next(null, [depOrPluginName]);
					}	
					
				}, function(err, items) {
					next(null, {
						multi: multi,
						names: Array.prototype.concat.apply([], items)
					});
				});

				
			}, function(err, deps) {
				plugin._deps = deps;
				self._plugins.add(plugin);
				callback(null, plugin);
			})
		});
		
		if(this.source.load) {
			this.source.load(onPlugin);
		} else {
			onPlugin(null, this.source);
		}
	}
});

module.exports.test = function(source) {
	return typeof source != "undefined" && (source.load || source.plugin) /*typeof source === "object"*/ && !(source instanceof Array);
}