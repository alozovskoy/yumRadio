function videoGetQueue(){
    sendMessage(JSON.stringify({type: "video", action: "videoGetQueue"}));
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
			tableData += '<td>' + item['name'] + ', ' + toFormattedTime(time, true, false)  + '</td><td><button class="btn btn-block btn-warning" onclick="videoDelete(\'' + item['item'] + '\');">DEL</button></td></tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan=2>Очередь пуста</td></tr>'
	}
	
	$('#queue').html(tableHead + tableData + tableTail);
};

videoGetQueue();
setInterval(videoGetQueue, 1000);

function videoNext(){

	var adminkey = $adminkey.val();
	sendMessage(JSON.stringify({type: "video", action: "videoPlayNext", adminkey: adminkey}));	
    return false;
};

function videoDelete(videoID){
    console.log(videoID);

	var adminkey = $adminkey.val();
	sendMessage(JSON.stringify({type: "video", action: "videoDelete", adminkey: adminkey, videoid: videoID}));
    return false;

};
