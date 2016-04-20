function getUsers(){
    var adminkey = $adminkey.val();
    sendMessage(JSON.stringify({type: "users", action: "getUsers", adminkey: adminkey}));
    return false;
};

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

function wsOnUsers(data){
    console.log(data);
	var users = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered"><tbody>'
	var tableTail = '</tbody></table>'
    var tableData = ''

	if ( Object.keys(users).length > 0 ){
		for (var key = 0; key < Object.keys(users).length ; key++) {
			var item = JSON.parse(users[key]);
			tableData += '<tr><td>' + timeConverter(item['lasttime']) + '</td><td>' + item['names'] + '</td><td><button class="btn btn-block btn-warning" onclick="deleteUser(\'' + item['item'] + '\');">DEL</button></td></tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan=3>Нет пользователей оО</td></tr>'
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

function banUser(userid){
    
    alert('ban ' + userid);
    
}
