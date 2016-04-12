function videoNext(){

    $adminkey = $("input[name='adminkey']");

	var adminkey = $adminkey.val();
	sendMessage(JSON.stringify({type: "video", action: "videoPlayNext", adminkey: adminkey}));	
    return false;
};

function videoDelete(){

    $adminkey = $("input[name='adminkey']");
    $videoid = $("input[name='videoid']");

	var adminkey = $adminkey.val();
	var videoid = $videoid.val();
	
    return false;

};

ws.onmessage = function (evt) {
    var data = JSON.parse(evt.data)
    console.log(data)
    var type = data['type']
};
