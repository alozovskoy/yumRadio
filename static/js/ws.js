function getLatency(){
    pingStartTime = Date.now();
    sendMessage(JSON.stringify({type: "ping", action: "ping"}));
    return false;
}

ws.onmessage = function (evt) {
    var data = JSON.parse(evt.data)
    
    console.log(data)
    
    var type = data['type']
	var action = data['action']
	
	switch (type){
		
		case 'chat':
			switch (action){
				
				case 'inMessage':
					var name = data['name']
					var msg = data['msg']
					inMessage(name, msg)
					break
				
				default:
					console.log('Error in chat - action = ' + action);
			}
			break
			
		case 'alert':
			switch (action){
				
				case 'placeAlert':
					var status = data['status']
					var msg = data['msg']
					placeAlert(status, msg)
					break
					
				default:
					console.log('Error in alert - action = ' + action);
			}
			break
			
		case 'video':
			switch (action){
					
				case 'next':
					$('#nextplay').text(data['title'])
					break

				case 'currentvideo':
					$('#current').text(data['videoid'])
					currentVideoOnServer = data['videoid']
					currentTimeOnServer = data['time']
					break				
					
				case 'getQueue':
					wsOnQueue(data['queue'])
					break
					
				case 'play':
					player.loadVideoById(
					{
						'videoId': data['videoid'], 
						'startSeconds': data['start'], 
						'suggestedQuality': "large"
					})
					break
					
				default:
					console.log('Error in video - action = ' + action)
			}
			break
            
        case 'ping':
            latency = Date.now() - pingStartTime;
            parsedLatency = parseInt(latency / 1000)
            console.log('latency: ' + latency + ', ' + parsedLatency );
            break

		case 'opinion':
            printOpinion(data['likeCount'], data['dislikeCount']);
            break
            
		default:
			console.log('Error - type = ' + type);
	}
}

setInterval(getLatency, 500);
