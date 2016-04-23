function getUsers(){
    sendMessage(JSON.stringify({type: "users", action: "getUsers"}));
    return false;
};

function wsOnUsers(data){
	var users = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered"><tbody>'
	var tableTail = '</tbody></table>'
    var tableData = ''

	if ( Object.keys(users).length > 0 ){
		for (var key = 0; key < Object.keys(users).length ; key++) {
			var item = JSON.parse(users[key]);
			tableData += '<tr><td>' + unixtimeToTime(item['lasttime']) + '</td><td>' + item['names'] + '</td><td><button class="btn btn-block btn-warning" onclick="deleteUser(\'' + item['item'] + '\');">DEL</button></td><td><button class="btn btn-block btn-danger" onclick="banUser(\'' + item['item'] + '\'); videoDelete(\'' + item['item'] + '\');">Забанить</button></td></tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan=3>Нет пользователей оО</td></tr>'
	}
	
	$('#users').html(tableHead + tableData + tableTail);
};

function deleteUser(userid){
    sendMessage(JSON.stringify({type: "users", action: "deleteUser", user: userid}));
    getUsers();
    return false;
}

