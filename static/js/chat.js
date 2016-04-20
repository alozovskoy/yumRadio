function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function chatGetMessage(name, msg){
	var username = safe_tags_replace(name);
	var usernamecolor = intToRGB(hashCode(username));
	var text = '<span style="color: #' + usernamecolor + ';">' + username + '</span>: ' + safe_tags_replace(msg);
	
	$('#chatframe').append('<p>' + text + '</p>');

	document.getElementById("chatframe").scrollTop = document.getElementById("chatframe").scrollHeight;
}


function chatSendMessage(){
	$msg = $("#chatMsg")
	$username = $("#chatUser")
	
	var msg = $msg.val()
	var username = $username.val()
	
	$msg.val('');
   
    sendMessage(JSON.stringify({type: "chat", action: 'sendMsg', msg: msg, user: username }));
	
	return false;
}
