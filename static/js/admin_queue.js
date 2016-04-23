function videoGetQueue(){
    sendMessage(JSON.stringify({type: "video", action: "videoGetAdminQueue"}));
    return false;
};

function wsOnQueue(data){
    console.log(data);
	var queue = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered"><tbody>'
	var tableTail = '</tbody></table>'
    var tableData = ''

	if ( Object.keys(queue).length > 0 ){
		for (var key = 0; key < Object.keys(queue).length ; key++) {
			var item = JSON.parse(queue[key]);
			time = parseInt(item['duration'])
			tableData += '<td>' + item['name'] + ', ' + toFormattedTime(time, true, false)  + '</td><td><button class="btn btn-block btn-warning" onclick="videoDelete(\'' + item['item'] + '\');">DEL</button></td>'
            if (item['userid']){
                
                tableData += '<td><button class="btn btn-block btn-danger" onclick="banUser(\'' + item['userid'] + '\'); videoDelete(\'' + item['item'] + '\');">Забанить</button></td>'
                
            }
            tableData += '</tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan=2>Очередь пуста</td></tr>'
	}
	
	$('#queue').html(tableHead + tableData + tableTail);
};

videoGetQueue();

function videoNext(){
	sendMessage(JSON.stringify({type: "video", action: "videoPlayNext"}));	
    return false;
};

function videoDelete(videoID){
	sendMessage(JSON.stringify({type: "video", action: "videoDelete", videoid: videoID}));
    return false;
};
