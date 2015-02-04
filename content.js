// this content-script plays role of medium to publish/subscribe messages from webpage to the background script

// this object is used to make sure our extension isn't conflicted with irrelevant messages!
var rtcmulticonnectionMessages = {
    "ping": true,
    "start_sharing": true
};

// this port connects with background script
var port = chrome.runtime.connect();

// if background script sent a message
port.onMessage.addListener(function (message) {
    // get message from background script and forward to the webpage
    window.postMessage(message, '*');
});

// this event handler watches for messages sent from the webpage
// it receives those messages and forwards to background script
window.addEventListener("message", function (event) {
    if (event.data.source == "webpage") {
        console.log("Receive\twebpage -> extension content script: " + event.data.type + "-" + event.data.message);
    }
    // if invalid source
    if (event.source != window)
        return;

    // it is 3rd party message
    if (!rtcmulticonnectionMessages[event.data.type]) return;

    // if browser is asking whether extension is available
    if (event.data.type == "ping") {
        return window.postMessage({ source: "actisto", message: "rtcmulticonnection-extension-loaded" }, "*");
    }

    // if it is something that need to be shared with background script
    if (event.data.type == "start_sharing") {
        // forward message to background script
        console.log("Send\textension content script -> background script: " + event.data.type + "-" + event.data.message);
        port.postMessage(event.data.type);
    }
});

// inform browser that you're available!
setTimeout(function () {
    var data = {
        source : "actisto_extension", 
        type: "message", 
        message: "rtcmulticonnection-extension-loaded"
    };
    console.log("Send\textension content script -> webpage: " + data.type + "-" + data.message);
    window.postMessage(data, '*');
}, 100);