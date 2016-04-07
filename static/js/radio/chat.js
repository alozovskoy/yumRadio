function inMessage(name, msg){
	var username = safe_tags_replace(name);
	var usernamecolor = intToRGB(hashCode(username));
	var text = '<span style="color: #' + usernamecolor + ';">' + username + '</span>: ' + safe_tags_replace(msg);
	
	$('#chatframe').append('<p>' + text + '</p>');

	document.getElementById("chatframe").scrollTop = document.getElementById("chatframe").scrollHeight;
}


function chatSend(){
	$msg = $("#msg")
	$username = $("#username")
	
	var msg = $msg.val()
	var username = $username.val()
	
	$msg.val('');
    
    sendMessage(JSON.stringify({msg: msg, user: username, type: "chat"}));
	
	return false;
}
