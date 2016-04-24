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

function userGetNicknames(){
    sendMessage(JSON.stringify({type: "users", action: "getNicknames"}));
    return false;
};

function wsOnNicknames(data){ 
	var nicknames = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered"><thead><tr><th colspan="2">Используемые ники</th></tr></thead><tbody>';
	var tableTail = '</tbody></table>';
    var tableData = '';
	if ( nicknames.length > 0 ){
		for (var key = 0; key < nicknames.length ; key++) {
			tableData += '<tr><td>' + (key + 1) + '</td><td>' + safe_tags_replace(nicknames[key])+ '</td></tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan="2">Ты ничего не писал в чате</td></tr>'
	}
	
	$('#userNicknames').html(tableHead + tableData + tableTail);
};

userGetNicknames();
setInterval(userGetNicknames, 1000);


function userGetDislikes(){
    sendMessage(JSON.stringify({type: "users", action: "getDislikes"}));
    return false;
};

userGetDislikes();
setInterval(userGetDislikes, 1000);

function wsOnDislikes(data){
	var dislikes = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered"><thead><tr><th colspan="2">Слитые треки</th></tr></thead><tbody>';
	var tableTail = '</tbody></table>';
    var tableData = '';
	if ( dislikes.length > 0 ){
		for (var key = 0; key < dislikes.length ; key++) {
			tableData += '<tr><td>' + (key + 1) + '</td><td>' + dislikes[key]+ '</td></tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan="2">Твои треки всем нравятся</td></tr>'
	}
	
	$('#userDislikes').html(tableHead + tableData + tableTail);
};
