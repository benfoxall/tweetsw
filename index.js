require('dotenv').load();

var Tweets = require('tweets');
var Pusher = require('pusher');
var express = require('express');

var stream = new Tweets({
  consumer_key:        process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:     process.env.TWITTER_CONSUMER_SECRET,
  access_token:        process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var pusher = new Pusher({
  appId:  process.env.PUSHER_APP_ID,
  key:    process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET_KEY
});


stream.filter({track: 'java'});

stream.on('tweet', function(t){
  console.log("Got a tweet!", t.text);

  pusher.trigger('all', 'tweet', t);
});

var app = express();

app.use(express.static('public'));
app.use(express.static('node_modules/dexie/dist/latest'));

app.get('/key', function(req, res){
    res.send(process.env.PUSHER_APP_KEY);
});

app.listen(4444);
