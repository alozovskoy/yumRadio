{% include reconnecting-websocket.js %}

var $wsStatus = $('#wsStatus');

var ws = new ReconnectingWebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.hostname + ':' + window.location.port + '/ws');

ws.onopen = function(){
$wsStatus.attr("class", 'btn btn-success navbar-btn');
};

ws.onclose = function(ev){
var text = '';
if (ev.wasClean){ text = 'disconnected' ;} else { text = 'error'; };
$wsStatus.attr("class", 'btn btn-danger navbar-btn');
};

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
