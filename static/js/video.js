function videoSend(){
    $vid = $("input[name='videoid']");
    var vid = $vid.val();
    console.log(vid);
    $vid.val('');
    sendMessage(JSON.stringify({id: vid, type: "video", action: "videoAdd"}));
    return false;
};

$('#video').submit(videoSend);

function videoGetCurrent(){
    sendMessage(JSON.stringify({type: "video", action: "videoGetCurrent"}));
    return false;
};

function videoGetNext(){
    sendMessage(JSON.stringify({type: "video", action: "videoGetNext"}));
    return false;
};

setInterval(videoGetCurrent, 500);
setInterval(videoGetNext, 1000);
