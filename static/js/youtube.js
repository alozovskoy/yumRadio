currentVideoOnClient = '';
currentTimeOnClient = '';
currentVideoOnServer = '';
currentTimeOnServer = '';

playerHeight = '';

currentVideoTitle = '';

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

setInterval(nowPlay, 200);
setInterval(nowPlayTitle, 1000);
setInterval(checkCurrentVideo, 1000);
setInterval(checkCurrentTime, 1000);
setInterval(getPlayerHeight, 1000);
}

function scrollTitle(){
    
    var start = 0;
    var stop = 40;
    var max = 40;
    var direction = 'inc';

    function scroll(){
        
        if (currentVideoTitle.length > max){
            
            $('#currentVideoDescription').text('Сейчас играет: ');
            $('#currentVideoTitle').text(currentVideoTitle.substring(start, stop));
            
            if (direction == 'inc'){
                start++;
                stop++;
            } else {
                start--;
                stop--;
            }
            
        } else if (currentVideoTitle.length == 0) {
            $('#currentVideoDescription').text('');
            $('#currentVideoTitle').text('');
            
        } else {
            
            $('#currentVideoDescription').text('Сейчас играет: ');
            $('#currentVideoTitle').text(currentVideoTitle);
            
        };
    
        if (stop == currentVideoTitle.length){
            direction = "dec"
        };
        
        if (start == 0){
            direction = "inc"
        };

    };
    
    setInterval(scroll, 500);
}

scrollTitle();

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

var volumeCount = 100;
var mute = false;

function muteToggle(){
    if (player.isMuted()){
        player.unMute();
        mute = false;
        setVolume();
    } else {
        player.mute();
        mute = true;
        setVolume();
    }
}

function volumeUp(){
    if (volumeCount < 100){
        volumeCount += 10;
        setVolume();
    }
}

function volumeDown(){
    if (volumeCount > 0){
        volumeCount -= 10;
        setVolume();
    }
}

function setVolume(){
    if (player){
        player.setVolume(volumeCount);
    }
    if (mute){
        $('#muteButton').removeClass('btn-primary');
        $('#muteButton').addClass('btn-default');
    } else {
        $('#muteButton').removeClass('btn-default');
        $('#muteButton').addClass('btn-primary');
    }
    document.getElementById("volume").innerHTML = volumeCount;

}

setVolume();
