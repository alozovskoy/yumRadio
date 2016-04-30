currentVideoOnClient = '';
currentVideoOnServer = '';
currentTime = 0;

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
			start:          currentTime,
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
  
    function checkCurrent(){

        if ( currentVideoOnClient != currentVideoOnServer ){
            
            currentVideoOnClient = currentVideoOnServer;
            
            player.loadVideoById({
                'videoId': currentVideoOnClient,
                'startSeconds': currentTime,
                'suggestedQuality': "large"})

        }
    }

    function nowPlay(){
        
        var percent = 0;
        var currentPlayTime = 0;
        var totalPlayTime = 0;
        var hours;
        
        if (currentVideoOnClient){
            currentPlayTime = parseInt(player.getCurrentTime());
            totalPlayTime = parseInt(player.getDuration())
        } else {
            currentPlayTime = 0;
            totalPlayTime = 0;
        }

        if (currentPlayTime != 0){
            var percent = parseInt(currentPlayTime / totalPlayTime * 100 );
            
            if ((currentPlayTime > 3600) || (totalPlayTime > 3600)){
                hours = true;
            } else {
                hours = false;
            }
            
        } else {
            percent = 0;
        }        

        $('#currentTime').text(toFormattedTime(currentPlayTime, hours, false) + ' / ' + toFormattedTime(totalPlayTime, hours, false));
        $('#playProgress').css('width', percent + '%');

    };
    
    function getPlayerHeight(){
        var height = $('#player').height();
        if (height){
            playerHeight = height;
        }
    };

setInterval(nowPlay, 200);
setInterval(checkCurrent, 1000);
setInterval(getPlayerHeight, 1000);
}

function scrollTitle(){
    
    var start = 0;
    var stop = 40;
    var max = 40;
    var direction = 'inc';

    function scroll(){

        currentVideoTitle = player.getVideoData().title;
    
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
