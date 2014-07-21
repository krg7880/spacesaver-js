var SpaceSaver = require('./lib/');

// Test Leaderboard
var spacesaver = new SpaceSaver(100);
var leaderboard = 'topsites';
var members = ['www.google.com', 'www.nytmes.com', 'www.yahoo.com', 'www.cnn.com'];
var membersTwo = ['www.facebook.com', 'www.twitter.com', 'www.tumblr.com'];

var max = 10000;
var count = 0;

function run() {
  spacesaver.add(leaderboard, members)
    .add('social', membersTwo).increment(function(e, res) {
      if (++count >= (max * ((members.length + membersTwo.length)-1)) ) {
        // pick one member to be the leader
        var idx = Math.floor(Math.random() * (members.length-1));
        var leader = members[idx];
        spacesaver.add(leaderboard, [leader]).increment(function(e, res) {
          spacesaver.leaders(leaderboard, null, function(e, res) {
            console.log('news', res);
            spacesaver.leaders('social', null, function(e, res) {
              console.log('social', res);
              process.exit();
            });
          });
        });
      }
    });
}

for (var i=0; i<max; i++) 
  run();