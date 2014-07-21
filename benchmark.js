var SpaceSaver = require('./lib/queue');

// Test Leaderboard
var spacesaver = new SpaceSaver(100);
var leaderboard = 'sites';

var max = 10000;
var count = 0;
var value = ['http://www.google.com'];

function run() {
  spacesaver.increment({leaderboard: leaderboard, values: value}).process(function(e, res) {
    if (++count >= max) {
      spacesaver.leaders({leaderboard: leaderboard}, function(e, res) {
        console.log('leaders', res);
        process.exit();
      });
    }
  });
}

for (var i=0; i<max; i++) 
  run();