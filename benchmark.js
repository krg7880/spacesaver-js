var SpaceSaver = require('./lib/queue');

// Test Leaderboard
var spacesaver = new SpaceSaver(100);
var leaderboard = 'sites';

var max = 10000;
var count = 0;
var value = ['http://www.google.com'];

function run() {
  spacesaver.add({leaderboard: leaderboard, values: value}).increment(function(e, res) {
    if (++count >= max) {
      spacesaver.leaders(leaderboard, null, function(e, res) {
        console.log('leaders', res);
        process.exit();
      });
    }
  });
}

for (var i=0; i<max; i++) 
  run();