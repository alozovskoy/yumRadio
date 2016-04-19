var currentVideoOnClient;
var currentTimeOnClient;
var currentVideoOnServer;
var currentTimeOnServer;

var playerHeight;

var currentVideoTitle = '';

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		videoId: currentVideoOnClient,
		playerVars: { 
			controls:       0,
			autoplay:       1,
			disablekb:      1,
			fs:             0,
			iv_load_policy: 3,
			modestbranding: 1,
			rel:            0,
			showinfo:       0,
			start:          currentTimeOnClient,
		},
		events: {
        'onStateChange' :   onPlayerStateChange,
        'onReady':          StartVideo,
		}
	});
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PAUSED) {
        event.target.playVideo();
    }
}

function StartVideo(){

    function nowPlayTitle(){
        currentVideoTitle = player.getVideoData().title;
        $('#currentVideo').text(currentVideoTitle);
        return false;
    };
    
    function checkCurrentTime(){
        if ( currentVideoOnClient != currentVideoOnServer ){
            currentTimeOnClient = currentTimeOnServer;
            currentVideoOnClient = currentVideoOnServer;
            player.loadVideoById({'videoId': currentVideoOnClient, 'startSeconds': currentTimeOnClient, 'suggestedQuality': "large"})
        }
        return false;
    }
    
    function nowPlay(){
        
        if (currentVideoOnClient){
        currentTimeOnClient = parseInt(player.getCurrentTime());
        } else {
            currentTimeOnClient = 0;
        }
        
        var currentTime = currentTimeOnClient;
        if (currentTimeOnClient > 3600){
            hoursClient = true;
        } else {
            hoursClient = false;
        }
        
        totalTime = parseInt(player.getDuration())
        
        if (totalTime > 3600){
            hoursTotal = true;
        } else {
            hoursTotal = false;
        }
        if (currentTime != 0){
            var percent = parseInt(currentTime / totalTime * 100 );
        } else {
            percent = 0;
        }
        $('#currentTime').text(toFormattedTime(currentTime, hoursClient, false) + ' / ' + toFormattedTime(totalTime, hoursTotal, false));
        $('#playProgress').css('width', percent + '%');
        return false;
    };
    
    function checkCurrentVideo(){
        if (currentVideoOnClient != currentVideoOnServer){
            player.loadVideoById({
                            'videoId': currentVideoOnServer, 
                            'startSeconds': currentTimeOnServer, 
                            'suggestedQuality': "large"
                            });
            };
            currentVideoOnClient = currentVideoOnServer;
            currentTimeOnClient = currentTimeOnServer;
    }
    
    function getPlayerHeight(){
        var height = $('#player').height();
        if (height){
            playerHeight = height;
        }
    };

setInterval(nowPlay, 1000);
setInterval(nowPlayTitle, 1000);
setInterval(videoGetCurrent, 1000);
setInterval(videoGetNext, 1000);
setInterval(checkCurrentVideo, 1000);
setInterval(checkCurrentTime, 1000);
setInterval(getPlayerHeight, 1000);
}

function checkVideoPlaceholder(){
    if ( currentVideoOnClient ){
        $('#player').show();
        $('#playerPlaceholder').hide();
    } else {
        $('#playerPlaceholder').css('height', playerHeight);
        $('#player').hide();
        $('#playerPlaceholder').show();      
    }
}

checkVideoPlaceholder();
setInterval(checkVideoPlaceholder, 500);

function muteToggle(){
    if (player.isMuted()){
        player.unMute();
        $('#muteButton').text('Mute');
    } else {
        player.mute();
        $('#muteButton').text('unMute');
    }
}
