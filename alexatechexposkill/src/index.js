/**
 * HTTP GET example
 * 
 * Additional Notes
 * https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        if (event.session.application.applicationId !== "amzn1.ask.skill.2767985b-1e37-48c0-a13e-f4aead039ec6") {
            context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId + ", intentName=" + intentName);

    // Dispatch to your skill's intent handlers
    if ("HelpIntent" === intentName) {
    }
    else if ("GetPasscodeIntent" === intentName) {
        console.log("UserId=" + JSON.stringify(session.user));
        getPasscodeResponse(session.user.userId, callback);
    } else if ("MakeBidIntent" === intentName) {
        makeBidResponse(session.user.userId, intentRequest.intent, callback);
    } else if ("EndAuctionIntent" === intentName) {
        quitAuctionResponse(callback);
    } else {
        throw "Invalid intent";
    }
}


/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------
function getPasscodeResponse(userId, callback) {
    var sessionAttributes = {};
    var repromptText = null;

    var cardTitle = "Get Passcode";

    getPasscode(userId, function (passcode) {

        var speechOutput = "<speak>Your passcode is <say-as interpret-as=\"digits\">" + passcode + "</say-as></speak>";
        var titleOutput = "Your passcode is " + passcode;
        var shouldEndSession = true;

        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, titleOutput, speechOutput, repromptText, shouldEndSession));

    });
}

function makeBidResponse(userId, intent, callback) {
    var sessionAttributes = {};
    var repromptText = null;

    var cardTitle = "Make Bid";

    makeBid(userId, intent.slots.Bid.value, function (result, message) {

        var speechOutput = "";
        var titleOutput = "";
        var shouldEndSession = true;

        if (result) {
            speechOutput = "Congratulations, " + message;
        }
        else {
            speechOutput = "I'm sorry, " + message;
        }

        titleOutput = speechOutput;

        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, titleOutput, speechOutput, repromptText, shouldEndSession));

    });
}

function quitAuctionResponse(callback) {
    var sessionAttributes = {};
    var repromptText = null;

    var cardTitle = "End Auction";

    quitAuction(function (result, message) {

        var speechOutput = "";
        var titleOutput = "";
        var shouldEndSession = true;

        if (result) {
            speechOutput = "Okay, I've ended the auction.";
        } else {
            speechOutput = "Sorry, couldn't end the auction";
        }

        titleOutput = speechOutput;

        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, titleOutput, speechOutput, repromptText, shouldEndSession));

    });
}

// function testGet(response) {

//     var http = require('http');
//     var options = {
//         host: 'www.bing.com',
//         port: 80,
//         path: '/',
//         agent: false
//     };

//     http.get(options, function (res) {
//         console.log("Response: " + res.statusCode);
//         response(res.statusCode);
//     }).on('error', function (e) {
//         console.log("Error message: " + e.message);
//     });

// }

function getPasscode(clientid, response) {
    var http = require("http");

    var options = {
        "method": "PATCH",
        "hostname": "vauctiontechexpo-dev.us-east-1.elasticbeanstalk.com",
        "port": "80",
        "path": "/api/passcode/" + encodeURIComponent(clientid),
        "headers": {
            "cache-control": "no-cache"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());

            response(JSON.parse(body).passcode);
        });
    });

    req.end();
}

function makeBid(clientid, bid, response) {
    var http = require("http");

    var options = {
        "method": "PUT",
        "hostname": "vauctiontechexpo-dev.us-east-1.elasticbeanstalk.com",
        "port": "80",
        "path": "/api/bid/",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            var bodyJson = JSON.parse(body);
            response(bodyJson.result, bodyJson.message);
        });
    });

    req.write(JSON.stringify({ bid: bid, socketid: null, clientid: clientid }));
    req.end();
}

function quitAuction(response) {
    var http = require("http");

    var options = {
        "method": "DELETE",
        "hostname": "vauctiontechexpo-dev.us-east-1.elasticbeanstalk.com",
        "port": "80",
        "path": "/api/bid/",
        "headers": {
            "cache-control": "no-cache"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            if (body.toString() == "OK") { response(true, ""); }
            else { response(false, ""); }
        });
    });

    req.end();
}


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, titleOutput, output, repromptText, shouldEndSession) {
    var outputSpeech = { type: "PlainText", text: output };
    if (output.startsWith("<speak>")) {
        outputSpeech = { type: "SSML", ssml: output };
    }
    return {
        outputSpeech: outputSpeech,
        card: {
            type: "Simple",
            // title: "SessionSpeechlet - " + title,
            // content: "SessionSpeechlet - " + output
            title: title,
            content: titleOutput
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}