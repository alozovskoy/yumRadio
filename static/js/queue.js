function videoGetQueue(){
    sendMessage(JSON.stringify({type: "video", action: "videoGetQueue"}));
    return false;
};

function wsOnQueue(data){
	var queue = JSON.parse(data);
	var tableHead = '<table class="table table-striped table-condensed"><tbody>'
	var tableTail = '</tbody></table>'
    var tableData = ''

	if ( Object.keys(queue).length > 0 ){
		for (var key = Object.keys(queue).length; key > 0 ; key--) {
			var item = JSON.parse(queue[key - 1]);
            var next = '';
			time = parseInt(item['duration']);
			tableData += '<tr><td>' + key + '</td><td class="text-center">\
                <a href="https://www.youtube.com/watch?v='+ item['item'] + '" style="display: block;">\
                    <img src="' + item['thumbnail'] + '" style="height: 32px;"/></a></td><td><a class="btn btn-block" href="https://www.youtube.com/watch?v='+ item['item'] + '" style="display: block;">' + item['name'] + ', ' + toFormattedTime(time, true, false)+ '</a></td></td></tr>'
		}
	}
	else {
		var tableData = '<tr><td>Очередь пуста</td></tr>'
	}
	
	$('#queue').html(tableHead + tableData + tableTail);
};

videoGetQueue();
setInterval(videoGetQueue, 1000);
