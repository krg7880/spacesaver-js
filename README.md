spacesaver-js
=============

Estimate [Top-k](https://icmi.cs.ucsb.edu/research/tech_reports/reports/2005-23.pdf) elements in data stream using SpaceSaver algorithm. Backed by RedisDB

Installation
------------
npm install spacesaver-js

Example usage
-------------
```javascript
var SpaceSaver = require('./lib/');
var k = 100;
var spacesaver = new SpaceSaver(k);
var leaderboard = 'top-news-sites';
var members = ['www.nytimes.com', 'www.cnn.com', 'www.huffpo.com'];
```

```javascript
spacesaver.add(leaderboad, members)
	.increment(function(e, res) {
		// fetch the leaders
		spacesaver.leaders(leaderboard, k, function(e, res) {
			console.log(res);
		})
	});
```

```javascript

// news - top k
[ 'www.nytmes.com',
  '240985',
  'www.yahoo.com',
  '240847',
  'www.google.com',
  '240365',
  'www.cnn.com',
  '170721',
  'http://www.tumblr.com',
  '10000' 
]

// social - top 1 of k

[ 
	'www.twitter.com', '170721' 
]

Testing
-------
```javascript
npm test
```

TODO 
----
Test is broken since the switch to support
internal queues. Prior to this, you needed
to add a member one at a time. Now you 
can pass a collection of memebers to increment! 