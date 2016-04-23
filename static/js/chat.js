var adminMsg = false;

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

function chatGetMessage(name, sender, msg){
    var username = '';
    var message = '';
    
    if (message.startsWith('http') && (message.endsWith('.png') || message.endsWith('.jpg') || message.endsWith('.gif'))){
        message = '<a href="' + message + '"><img src="' + message + '" height="50px"></a>'
    }
    
    if (sender == 'system'){
        username = name;
        message = msg
        
        var text = '<span style="color: #fea610;"> &#10047; ' + username + '</span>: ' + message;
    } else {
        username = safe_tags_replace(name);
        message = safe_tags_replace(msg)
        var usernamecolor = intToRGB(hashCode(username));
        var text = '<span style="color: #' + usernamecolor + ';">' + username + '</span>: ' + message;
    }

	$('#chatframe').append('<p>' + text + '</p>');

	document.getElementById("chatframe").scrollTop = document.getElementById("chatframe").scrollHeight;
}


function chatSendMessage(){
	$msg = $("#chatMsg")
	$username = $("#chatUser")
	
	var msg = $msg.val();
	var username = $username.val();
	var sender = 'user';
    
	$msg.val('');
   
    if (adminMsg){
        sender = 'system'
    }
   
    sendMessage(JSON.stringify({type: "chat", action: 'sendMsg', msg: msg, user: username, sender: sender }));
	
	return false;
}

function isAdminCheck(){
    sendMessage(JSON.stringify({type: "auth", action: 'isAdmin'}));
};

setInterval(isAdminCheck, 5000);

function isAdmin(admin){
    if (admin == 'True'){
        $('#systemMessageButton').show();      
    } else {
        $('#systemMessageButton').hide();
    }
}

function switchAdminMessage(){
    if (adminMsg){
        $('#systemMessageButtonEnabled').hide();
        $('#systemMessageButtonDisabled').show();
        adminMsg = false;
    } else {
        $('#systemMessageButtonEnabled').show();
        $('#systemMessageButtonDisabled').hide();
        adminMsg = true;
    }
}
