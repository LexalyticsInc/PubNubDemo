/**
 * Created by lexalytics on 3/20/17.
 */


//
//  Imports
//

//
//  IMPORT PUBNUB
//
var express = require('express'),
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

//
//  INITIALIZE PUBNUB
//


// Ping the Lexalytics Block
setInterval(function() {
    console.log("Pinging the Lexalytics Block");

    //
    //  INSERT PUBLISH TO LEXALYTICS BLOCK
    //

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

            //
            //  INSERT PUBLISH TO LEXALYTICS BLOCK
            //

        }

    });
});