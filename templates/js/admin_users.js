function getUsers(){
    var adminkey = $adminkey.val();
    sendMessage(JSON.stringify({type: "users", action: "getUsers", adminkey: adminkey}));
    return false;
};

function wsOnUsers(data){
    console.log(data);
	var users = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered"><tbody>'
	var tableTail = '</tbody></table>'
    var tableData = ''

	if ( Object.keys(users).length > 0 ){
		for (var key = 0; key < Object.keys(users).length ; key++) {
			var item = JSON.parse(users[key]);
			tableData += '<td>' + item['names'] + '</td><td><button class="btn btn-block btn-warning" onclick="deleteUser(\'' + item['item'] + '\');">DEL</button></td></tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan=2>Очередь пуста</td></tr>'
	}
	
	$('#users').html(tableHead + tableData + tableTail);
};

function deleteUser(userid){
    console.log('del');
    var adminkey = $adminkey.val();
    sendMessage(JSON.stringify({type: "users", action: "deleteUser", adminkey: adminkey, user: userid}));
    return false;
}

getUsers();
setInterval(getUsers, 1000);
