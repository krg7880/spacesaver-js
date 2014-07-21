var SpaceSaver = require('../lib/');

// Test Leaderboard
var spacesaver = new SpaceSaver(10);
var leaderboard = 'topsites';
var news_members = ['www.nytimes.com', 'www.google.com', 'www.yahoo.com', 'www.cnn.com'];

var max = 1;
var count = 0;

function run() {
  spacesaver.add(leaderboard, news_members)
    .increment(function(e, res) {
      if (++count >= (max * (news_members.length-1)) ) {
        spacesaver.leaders(leaderboard, null, function(e, res) {
          console.log('news', res);
          process.exit();
        });
      }
    });
}

for (var i=0; i<max; i++) 
  run();