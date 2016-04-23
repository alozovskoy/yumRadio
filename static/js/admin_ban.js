function getBan(){
    sendMessage(JSON.stringify({type: "users", action: "getBan"}));
    return false;
};

function wsOnBan(data){
	var ban = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered">\
                    <thead>\
                        <tr>\
                            <th></th>\
                            <th>Причина</th>\
                            <th>Время</th>\
                            <th></th>\
                            </tr>\
                        </thead>\
                    <tbody>'
	var tableTail = '</tbody></table>'
    var tableData = ''
    
    keys = Object.keys(ban);
    console.log(keys);
    
	if ( keys.length > 0 ){
		for (var key = 0; key < keys.length ; key++) {
			var item = keys[key]
			tableData += '<tr>\
                <td><button class="btn btn-block btn-success" onclick="unbanUser(\'' + item + '\');">Разбанить</button></td>\
                <td><input type="text" class="form-control" id="banDesc" value="' + ban[item]['description'] + '"></input></td>\
                <td><input type="text" class="form-control" id="banTime" value="' + unixtimeToTime(ban[item]['time']) +'"></input></td>\
                <td><button class="btn btn-block btn-danger" onclick="banUser(\'' + item + '\');">Перезабанить</button></td>\
                </tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan=3>Нет пользователей в бане</td></tr>'
	}
	
	$('#ban').html(tableHead + tableData + tableTail);
};

getBan();

function banUser(userid){
    if ($('#banDesc').val()){
        description = $('#banDesc').val();
    } else {
        description = "решение администратора"
    }
    if ($('#banTime').val()){
        sendMessage(JSON.stringify({type: "users", action: "ban", banid: userid, description: description, bantime: timeToUnixtime($('#banTime').val())}));
    } else {
        sendMessage(JSON.stringify({type: "users", action: "ban", banid: userid, description: description}));
    }
    
    return false;
};

function unbanUser(userid){
    sendMessage(JSON.stringify({type: "users", action: "unban", unbanid: userid}));
    return false;
};

