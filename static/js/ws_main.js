var $wsStatus = $('#wsStatus');

var ws = new ReconnectingWebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.hostname + ':' + window.location.port + '/ws');

pingStartTime=0;
latency = 0;

ws.onopen = function(){
$wsStatus.attr("class", 'btn btn-success navbar-btn');
};

ws.onclose = function(ev){
var text = '';
if (ev.wasClean){ text = 'disconnected' ;} else { text = 'error'; };
$wsStatus.attr("class", 'btn btn-danger navbar-btn');
};

function sendMessage(msg){
    waitForSocketConnection(ws, function(){
        var _msg = JSON.parse(msg);
        _msg['userid'] = getCookie('userid');
        _msg['sessionid'] = getCookie('sessionid');
        dataToSend = JSON.stringify(_msg);
        ws.send(dataToSend);
    });
}

function waitForSocketConnection(socket, callback){
    setTimeout(
        function () {
            if (socket.readyState === 1) {
                if(callback != null){
                    callback();
                }
                return;

            } else {
                waitForSocketConnection(socket, callback);
            }
        }, 5);
}
