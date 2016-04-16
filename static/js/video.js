function videoSend(){
    $vid = $("input[name='videoid']");
    var vid = $vid.val();
    console.log(vid);
    $vid.val('');
    sendMessage(JSON.stringify({id: vid, type: "video", action: "add"}));
    return false;
};

$('#video').submit(videoSend);

function videoGetCurrent(){
    sendMessage(JSON.stringify({type: "video", action: "videoGetCurrent"}));
    return false;
};

function videoGetQueue(){
    sendMessage(JSON.stringify({type: "video", action: "videoGetQueue"}));
    return false;
};


function videoGetNext(){
    sendMessage(JSON.stringify({type: "video", action: "videoGetNext"}));
    return false;
};


function wsOnQueue(data){
	var queue = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed table-bordered"><thead><tr><th>From:</th><th>Video:</th></tr></thead><tbody>'
	var tableTail = '</tbody></table>'
    var tableData = ''

	if ( Object.keys(queue).length > 0 ){
		for (var key = 0; key < Object.keys(queue).length ; key++) {
			var item = JSON.parse(queue[key]);
			time = parseInt(item['duration'])
			tableData += '<tr><td>NaN</td><td>' + item['name'] + ', ' + toFormattedTime(time, true, false)  + '</td></tr>'
		}
	}
	else {
		var tableData = '<tr><td colspan=2>Очередь пуста</td></tr>'
	}
	
	$('#queue').html(tableHead + tableData + tableTail);
};

videoGetQueue();
setInterval(videoGetQueue, 1000);
setInterval(videoGetCurrent, 500);
setInterval(videoGetNext, 1000);
