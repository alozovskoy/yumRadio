{% include static/js/wsInit.js %}
{% include static/js/misc.js %}
{% include static/js/cookie.js %}
{% include static/js/alert.js %}
{% include static/js/wsSendMessage.js %}
{% include static/js/wsOnMessage.js %}

function checkSessionData(){
    document.getElementById("userid").innerHTML = getCookie('userid');
    document.getElementById("sessionid").innerHTML = getCookie('sessionid');
}

function logoutThis(){
    deleteCookie('userid');
    deleteCookie('sessionid');
    checkSessionData();
}

function logoutAll(){
    sendMessage(JSON.stringify({type: "session", action: "dropsession"}));  
}

checkSessionData();
