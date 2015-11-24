importScripts('pusher.js', 'Dexie.js');

Dexie.Promise.on('error', function(err) {
    console.log("Uncaught error: " + err);
});
var db = new Dexie("Tweets");
db.version(1).stores({
  tweets: "&id,timestamp_ms,lang,retweeted"
});

var last;

self.addEventListener('install', function(event) {
  console.log("installing SW");
  event.waitUntil(
    fetch('/key')
      .then(function(r) {
          return r.text();
      })
      .then(function(key){
          new Pusher(key, {
              disableStats: true
          })
          .subscribe('all')
          .bind('tweet', function(data) {
              // indexedDb doesn't like booleans
              data.retweeted = data.retweeted ? 1 : 0;
              db.tweets.put(data);
              last = data;
          });

          return db.open();
      })
  );
});


self.addEventListener('fetch', function(event) {
    if(event.request.url.match(/hello\.csv$/)){
        event.respondWith(
            new Response("okay")
        );
    }

    if(event.request.url.match(/last\.txt$/)){
        event.respondWith(
            new Response((last && last.text) || 'nothing yet')
        );
    }



    if(event.request.url.match(/stats\.json$/)){
        event.respondWith(
            db.tweets.count()
            .then(function(d){
                return new Response(JSON.stringify({total:d}), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
    }

    if(event.request.url.match(/last\.json$/)){
        event.respondWith(
            new Response(JSON.stringify(last), {
                headers: { 'Content-Type': 'application/json' }
            })
        );
    }

    if(event.request.url.match(/tweets\.csv$/)){
        var rsp = '';

        event.respondWith(
            db
              .tweets
              .reverse()
              .limit(50)
              .each(function(tweet){
                  if(!tweet.user) return;
                  rsp += csv([tweet.user.screen_name, tweet.user.name, tweet.text]) + '\n';
              })
              .then(function(){
                return new Response( rsp, {
                  headers: { 'Content-Type': 'text/csv' }
                });
              })
        );
    }

    if(event.request.url.match(/tweets\.html$/)){

        // heh
        var htm = '<html><style>body{font-family:sans-serif;}</style><body><h1>OMG TWEETS!!!</h1>';

        event.respondWith(
            db
              .tweets
              .reverse()
              .limit(50)
              .each(function(tweet){
                  htm += '<h2>@' + tweet.user.screen_name + '</h2>';
                  htm += '<p>' + tweet.text + '</p>';
                  htm += '<hr />';
              })
              .then(function(){
                return new Response( htm, {
                  headers: { 'Content-Type': 'text/html' }
                });
              })
        );

    }


});




// pull out a row of keys
function row(keys, obj){
  return keys.map(function(k){
    return obj[k];
});
}
// create a csv row from an array
function csv(array){

  // this is not a world class csv generator
  return array.map(function(item){
    return  typeof(item) === 'string' ?
      item.replace(/[\",]/g,'') :
      item;
  }).join(',');
}
