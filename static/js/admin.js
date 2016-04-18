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
