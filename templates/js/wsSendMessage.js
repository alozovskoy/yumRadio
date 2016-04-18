function sendMessage(msg){
    waitForSocketConnection(ws, function(){
        var _msg = JSON.parse(msg);
        _msg['userid'] = getCookie('userid');
        _msg['sessionid'] = getCookie('sessionid');
        dataToSend = JSON.stringify(_msg);
        ws.send(dataToSend);
    });
}
