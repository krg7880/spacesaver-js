var SpaceSaver = require('./lib/');

// Test Leaderboard
var spacesaver = new SpaceSaver(100);
var leaderboard = 'topsites';
var news_members = ['www.google.com', 'www.nytmes.com', 'www.yahoo.com', 'www.cnn.com'];
var social_members = ['www.facebook.com', 'www.twitter.com', 'www.tumblr.com'];

var max = 1;
var count = 0;

function run() {
  spacesaver.add(leaderboard, news_members)
    .add('social', social_members).increment(function(e, res) {
      if (++count >= (max * ((news_members.length + social_members.length)-1)) ) {
        // pick one member to be the leader
        var idx = Math.floor(Math.random() * (news_members.length-1));
        var leader = news_members[idx];
        spacesaver.add(leaderboard, [leader]).increment(function(e, res) {
          /*spacesaver.leaders(leaderboard, null, function(e, res) {
            console.log('news', res);
            spacesaver.leaders('social', 1, function(e, res) {
              console.log('social', res);
              process.exit();
            });
          });*/
        });
      }
    });
}

for (var i=0; i<max; i++) 
  run();