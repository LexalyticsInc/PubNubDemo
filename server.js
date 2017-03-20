/**
 * Created by lexalytics on 3/20/17.
 */


//
//  Imports
//
var PubNub = require('pubnub'),
    express = require('express'),
    http = require('http'),
    twitter = require('twitter'),
    config = require('./config');



//
//  Express
//

//  Initialize
var app = express();
var port = process.env.PORT || 8080;

//  Static Files (/public)
app.use("/", express.static(__dirname + "/public/"));

//  Start
var server = http.createServer(app).listen(port, function() {
    console.log('Express server listening on port ' + port);
});


//
//  PubNub
//

//  Initialize
var pubnub = new PubNub(config.pubnub);


// Ping the Lexalytics Block
setInterval(function() {
    console.log("Pinging the Lexalytics Block");
    pubnub.publish(
        {
            message: {},
            channel: 'lexalytics-channel',
            sendByPost: false, // true to send via post
            storeInHistory: false //override default storage options
        },
        function (status, response) {
            if (status.statusCode == 200) {
                console.log("   Publish Success");
            } else {
                console.log("   Publish Failure");
            }
        }
    );
}, 5000);


//
//  Twitter
//

//  Initialize
var twit = new twitter(config.twitter);

//  Listen to Hashtag
// Set a stream listener for tweets matching tracking keywords
twit.stream('statuses/filter',{ track: '#lexdemo'}, function(stream){

    stream.on('data', function(data) {
        console.log("Received a Tweet: ");
        if (data['user'] !== undefined) {
            pubnub.publish({
                    message: { "docs": [{"text": data['text']}] },
                    channel: 'lexalytics-channel',
                    sendByPost: false, // true to send via post
                    storeInHistory: false, //override default storage options
                    meta: { id_str: data.id_str,  screen_name: data.user.screen_name} // publish extra meta with the request
                },
                function (status, response) {
                    if (status.statusCode == 200) {
                        console.log("   Publish Success");
                        console.log("   Published Message Text: " + data['text']);
                    } else {
                        console.log("   Publish Failure");
                    }
                }
            );

        }

    });
});