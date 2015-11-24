require('dotenv').load();

var Tweets = require('tweets');

var stream = new Tweets({
  consumer_key:        process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:     process.env.TWITTER_CONSUMER_SECRET,
  access_token:        process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


stream.filter({track: 'pizza'});

stream.on('tweet', function(t){
  console.log("Got a tweet!", t.text);
});
