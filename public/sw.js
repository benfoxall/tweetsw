importScripts('pusher.js');

fetch('/key')
    .then(function(r) {
        return r.text();
    })
    .then(function(key){
        var pusher = new Pusher(key, {
            disableStats: true
        });
        var channel = pusher.subscribe('all');
        channel.bind('tweet', function(data) {
            // way more data here
            console.log("tweet", data);
        });
    });
