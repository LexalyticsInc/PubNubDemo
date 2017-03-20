/**
 * Created by lexalytics on 3/20/17.
 */

var canvas = document.getElementById("body");
var width = document.getElementById("body").clientWidth;
var height = document.getElementById("body").clientHeight;
var max_pills = 50;

// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint;


// create an engine
var engine = Engine.create({
    render: {
        element: null,
        options: {
            width: width,
            height: height,
            background: '#fafafa',
            wireframeBackground: '#222',
            hasBounds: false,
            enabled: true,
            wireframes: true,
            showSleeping: true,
            showDebug: false,
            showBroadphase: false,
            showBounds: false,
            showVelocity: false,
            showCollisions: false,
            showAxes: false,
            showPositions: false,
            showAngleIndicator: false,
            showIds: false,
            showShadows: false
        }
    }
});


//  Update Gravity
engine.world.gravity.y = 1;

var ground = Bodies.rectangle(width / 2, height - 10, width, 10, { isStatic: true });
var left_wall = Bodies.rectangle(0, height, 10, height / 2, { isStatic: true });
var right_wall = Bodies.rectangle(width, height, 10, height / 2, { isStatic: true });

// add all of the bodies to the world
World.add(engine.world, [ground, right_wall, left_wall]);

// run the engine
Engine.run(engine);

//  Create arrays to hold state
var bodiesDom = document.querySelectorAll('.block');
var bodies = [];


window.requestAnimationFrame(update);

function update() {
    for (var i = 0, l = bodiesDom.length; i < l; i++) {
        var bodyDom = bodiesDom[i];
        var body = null;
        for (var j = 0, k = bodies.length; j < k; j++) {
            if ( bodies[j].id == bodyDom.id ) {
                body = bodies[j];
                break;
            }
        }

        if ( body === null ) continue;

        bodyDom.style.transform = "translate( " + (body.position.x - bodyDom.offsetWidth/2)
            + "px, "
            + (body.position.y - bodyDom.offsetHeight/2)
            + "px )";
        bodyDom.style.transform += "rotate( " + body.angle + "rad )";

    }
    window.requestAnimationFrame(update);
}


//  TODO:  Centralize this repeated function.
function sentimentToColor(sentiment_phrase) {

    switch(sentiment_phrase) {
        case "negative":
            return "#ef5350";
            break;
        case "positive":
            return "#66bb6a";
            break;
        default:
            return "#8e8e8e";
    }

}

function typeToColor(type) {

    switch(type) {
        case "E":
            return "#35c8ed";
            break;
        case "P":
            return "#e01eb8";
            break;
        case "C":
            return "#f6c10b";
            break;
        default:
            return "#f48200";
    }

}


function createPill(text, type, sentiment_color, type_color, twid) {

    //  Create the main pill
    var elem = document.createElement("div");
    var tweet_link = document.createElement("a");


    var text_elem = document.createElement("div");
    var tag_elem = document.createElement("div");

    var tag_node = document.createTextNode(type);
    var text_node = document.createTextNode(text);


    tag_elem.appendChild(tag_node);
    text_elem.appendChild(text_node);


    tweet_link.appendChild(tag_elem);
    tweet_link.appendChild(text_elem);

    elem.appendChild(tweet_link);


    //  Configure the anchor
    tweet_link.href = "https://twitter.com/SemantriaDemo/status/" + twid;
    tweet_link.style.color = "white";

    //  Style the type area
    tag_elem.style.borderRadius = "50%";
    tag_elem.style.width = "30px";
    tag_elem.style.height = "30px";
    tag_elem.style.backgroundColor = type_color;
    tag_elem.style.float = "left";
    tag_elem.style.textAlign = "center";
    tag_elem.style.lineHeight = "30px";
    tag_elem.style.fontWeight = "bold";
    tag_elem.style.fontSize = ".8em";
    tag_elem.style.marginRight = "5px";

    //  Style the text area
    text_elem.style.float = "left";


    //  Style the main pill
    elem.style.backgroundColor = sentiment_color;
    elem.style.borderRadius = "40px";
    elem.style.margin = "1px";
    elem.style.padding = "4px 10px 4px 5px";
    elem.style.fontFamily = "Roboto";
    elem.style.color = "white";
    elem.style.position = "absolute";
    elem.style.fontSize = "1.5em";
    elem.pointerEvents = "none";
    elem.className = "block";
    elem.style.visibility = "hidden";
    elem.style.overflow = "hidden";
    elem.style.whiteSpace = "nowrap";

    return elem;

}

function renderElem(elem, position, rotation) {

    canvas.appendChild(elem);

    var body = Bodies.rectangle(
        position,
        0,
        elem.offsetWidth,
        elem.offsetHeight
    );

    Matter.Body.rotate(body, rotation);
    body.restitution = 0.8;
    elem.id = body.id;

    bodies.push(body);
    bodiesDom = document.querySelectorAll('.block');

    return body;
}

function addAnalyticalItem(text, type, sentiment_phrase, twid) {

    var sentiment_color = sentimentToColor(sentiment_phrase);
    var type_color = typeToColor(type);

    //  Choose a start position and rotation
    var position = width*Math.random();
    var rotation = Math.random()*2*Math.PI;

    //  Create the text pill
    var text_pill_elem = createPill(text, type, sentiment_color, type_color, twid);
    var text_pill_body = renderElem(text_pill_elem, position, rotation);

    //  Add to the world
    World.add(engine.world, [text_pill_body]);

    //  Show the elems
    text_pill_elem.style.visibility = "visible";
    //
    // //  Prune World
    if (bodies.length > max_pills){
        var removed_body = bodies.splice(0, 1)[0];
        World.remove(engine.world, [removed_body]);
        var removed_elem = document.getElementById(removed_body.id);
        canvas.removeChild(removed_elem);

    }

}

function processResults(message) {
    try {
        console.log("New Message:" + JSON.stringify(message));
        for (var i = 0; i < message.message.length; i++)
        {
            var sem_result = message.message[i]; //  Get the Semantria BLOCK result
            var twid = sem_result.metadata.id_str;

            //  Add Entities!
            if (sem_result.entities) {
                var entities = sem_result.entities;
                for (var i = 0; i < entities.length; i++)
                {
                    console.log("   Entity!");
                    var entity = entities[i];
                    addAnalyticalItem(entity.title, "E", entity.sentiment_polarity, twid);
                }
            }
            //  Add Phrases!
            if (sem_result.phrases) {
                var phrases = sem_result.phrases;
                for (var i = 0; i < phrases.length; i++)
                {
                    console.log("   Phrase!");
                    var phrase = phrases[i];
                    addAnalyticalItem(phrase.title, "P", phrase.sentiment_polarity, twid);
                }
            }
            //  Add Categories!
            if (sem_result.auto_categories) {
                var categories = sem_result.auto_categories;
                for (var i = 0; i < categories.length; i++)
                {
                    console.log("   Category!");
                    var category = categories[i];
                    addAnalyticalItem(category.title, "C", category.sentiment_polarity, twid);
                }
            }

            //  Add Themes!
            if (sem_result.themes) {
                var themes = sem_result.themes;
                for (var i = 0; i < themes.length; i++)
                {
                    console.log("   Theme!");
                    var theme = themes[i];
                    addAnalyticalItem(theme.title, "T", theme.sentiment_polarity, twid);
                }
            }

        }
    } catch(err) {
        console.log("ERROR: " + err);
    }
};


//
//  PubNub
//

var pubnub = new PubNub({
    publishKey: "",
    subscribeKey: ""
});


pubnub.addListener({
    status: function(statusEvent) {
        if (statusEvent.category === "PNConnectedCategory") {
            console.log("Connected");
        }
    },
    message: function(message) {
        processResults(message);
    }
});

pubnub.subscribe({
    channels: ['semoutput']
});