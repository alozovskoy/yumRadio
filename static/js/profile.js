{% include static/js/reconnecting-websocket.js %}
{% include static/js/ws_main.js %}
{% include static/js/misc.js %}
{% include static/js/alert.js %}
{% include static/js/ws.js %}

function check(){
    document.getElementById("userid").innerHTML = getCookie('userid');
    document.getElementById("sessionid").innerHTML = getCookie('sessionid');
}

function logoutThis(){
    deleteCookie('userid');
    deleteCookie('sessionid');
    check();
}

function logoutAll(){
    sendMessage(JSON.stringify({type: "session", action: "dropsession"}));  
}

check();
