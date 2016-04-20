function videoGetQueue(){
    sendMessage(JSON.stringify({type: "video", action: "videoGetQueue"}));
    return false;
};

function wsOnQueue(data){
	var queue = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered"><tbody>'
	var tableTail = '</tbody></table>'
    var tableData = ''

	if ( Object.keys(queue).length > 0 ){
		for (var key = 0; key < Object.keys(queue).length ; key++) {
			var item = JSON.parse(queue[key]);
			time = parseInt(item['duration'])
			tableData += '<tr><td>NaN</td><td><a class="btn btn-default btn-block" href="https://www.youtube.com/watch?v=' + item['item'] + '">' + item['name'] + ', ' + toFormattedTime(time, true, false)  + '</td></tr>'
		}
	}
	else {
		var tableData = '<tr><td>Очередь пуста</td></tr>'
	}
	
	$('#queue').html(tableHead + tableData + tableTail);
};

videoGetQueue();
setInterval(videoGetQueue, 1000);
