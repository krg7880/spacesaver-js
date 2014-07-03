var path = require('path');
var client = require(path.resolve(__dirname + '/connection')).get();

function SpaceSaver(k) {
  this.k = k;
};

/**
@param {Object} o {leaderboard: <leaderboard>, value: <value}
@param {Function} cb Callback function
*/
SpaceSaver.prototype.increment = function(o, cb) {
  var self = this;
  client.zscore([o.leaderboard, o.value], function(e, score) {
    client.zcard(o.leaderboard, function(e, zcard) {
      if (score || (zcard < self.k)) {
        client.zincrby([o.leaderboard, 1, o.value], function(e, res) {
          cb(e, res);
        });
      } else {
        client.zrange([o.leaderboard, 0, 0, 'withscores'], function(e, scores) {
          if (e) return cb(e);
          var item, score = scores[0];
          var newScore = parseInt(score, 10) + 1;
          client.zrem([o.leaderboard, item], function(e, rem) {
            if (e) return cb(e);
            
              client.zadd([o.leaderboard, newScore, o.value], function(e, res) {
                if (e) return cb(e);
                cb(null, newScore);
              });
            
          });
        });
      }
    });
  });
};

SpaceSaver.prototype.leaders = function(o, cb) {
  if (typeof o === 'undefined') return cb(new Error('No options specified'));

  o.k = o.k || this.k;
  client.zrevrange([o.leaderboard, 0, o.k-1, 'withscores'], function(e, res) {
    cb(e, res);
  });
};

SpaceSaver.prototype.reset = function(leaderboard, cb) {
  console.log('reset', leaderboard);
  client.del(leaderboard, function(e, del) {
    console.log('del', leaderboard, e, del)
    cb(e, del);
  });
};

module.exports = SpaceSaver;