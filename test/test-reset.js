var SpaceSaver = require('../lib/index');
var spacesaver = new SpaceSaver(10);
var leaderboard = 'testing';
var urls = ['www.nytimes.com', 'www.google.com', 'www.yahoo.com', 'www.apple.com'];
var assert = require('assert');

function arrayToObject(arr) {
  var tmp = {};
  var len = arr.length;
  for(var i=0; i<len; i++) {
    tmp[arr[i]] = arr[++i];
  }

  return tmp;
};

describe('Testing leaderboard', function(){
  it('Should add ' + urls.length.toString() + 'to leaderboard', function(done) {
    // start fresh!
    spacesaver.reset(leaderboard, function(e, res) {
      if (e) return done(e);
      var completed = 0;
      urls.forEach(function(url) {
        spacesaver.increment({leaderboard: leaderboard, value: url}, function(e, res) {
          if (e) return done(e);
          if (++completed >= urls.length) {
            done();
          }
        });
      });
    })
  });

  it('Should fetch 4 leaders from the leaderboard', function(done) {
    this.timeout(5000);
    spacesaver.leaders({leaderboard: leaderboard}, function(e, res) {
      if (e) return done(e);
      var obj = arrayToObject(res);
      urls.forEach(function(url) {
        assert.equal(obj[url], 1, 'should have a score of 1');
      });

      done();
    });
  });
});