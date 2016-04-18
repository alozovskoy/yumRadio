var pingStartTime=0;
var latency = 0;

function getLatency(){
    pingStartTime = Date.now();
    sendMessage(JSON.stringify({type: "ping", action: "ping"}));
    return false;
}

setInterval(getLatency, 500);


