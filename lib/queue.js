module.exports = function() {
	
	var next = function() {
		var callback = queue.pop();

		if(!callback) {
			running = false;
			return;
		}

		callback(next);
	},
	running = false,
	started = false,
	queue = [];

	return {
		add: function(callback) {
			queue.unshift(callback);

			if(!running && started) {
				next();
			}
		},
		unshift: function(callback) {
			queue.push(callback);
		},
		start: function() {
			if(started) return;
			started = running = true;
			next();
		}
	}
}