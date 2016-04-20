function getBan(){
    var adminkey = $adminkey.val();
    sendMessage(JSON.stringify({type: "users", action: "getBan", adminkey: adminkey}));
    return false;
};

function wsOnBan(data){
	var ban = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered"><tbody>'
	var tableTail = '</tbody></table>'
    var tableData = ''

	if ( Object.keys(ban).length > 0 ){
		for (var key = 0; key < Object.keys(users).length ; key++) {
			var item = JSON.parse(ban[key]);
			tableData += '<tr><td>' + item + '</td><td>' + ban[item]['description'] +'</td><td>' + ban[item]['time'] +'</td></tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan=3>Нет пользователей в бане</td></tr>'
	}
	
	$('#ban').html(tableHead + tableData + tableTail);
};

/*function deleteUser(userid){
    console.log('del');
    var adminkey = $adminkey.val();
    sendMessage(JSON.stringify({type: "users", action: "deleteUser", adminkey: adminkey, user: userid}));
    return false;
}*/

getBan();
setInterval(getBan, 1000);

function banUser(userid){
    var adminkey = $adminkey.val();
    sendMessage(JSON.stringify({type: "users", action: "ban", adminkey: adminkey, banid: userid, description: 'test'}));
    return false;
};
