function check(){
    document.getElementById("userid").innerHTML = getCookie('userid');
    document.getElementById("sessionid").innerHTML = getCookie('sessionid');
    return none;
}

function logout(){
    deleteCookie('userid');
    deleteCookie('sessionid');
    check();
    return none;
}

check();
