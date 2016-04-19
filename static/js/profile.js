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
