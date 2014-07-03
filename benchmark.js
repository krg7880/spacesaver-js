var SpaceSaver = require('./lib/index');

// Test Leaderboard
var spacesaver = new SpaceSaver(100);
var leaderboard = 'persons';

var max = 10000;
var count = 0;
var value = 'www.nytimes.com';

function run() {
	spacesaver.increment({leaderboard: leaderboard, value: value}, function(e, res) {
		if (++count >= max) {
			spacesaver.leaders({leaderboard: leaderboard, k: 2}, function(e, res) {
				console.log('leaders', e, res);
				process.exit();
			});
		}
	});
}

for (var i=0; i<max; i++) 
	run();