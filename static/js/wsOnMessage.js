ws.onmessage = function (evt) {
    var data = JSON.parse(evt.data)
    
    var type = data['type']
	var action = data['action']
	
	switch (type){
		
		case 'chat':
			switch (action){
				
				case 'getMsg':
					chatGetMessage(data['name'], data['sender'], data['msg'])
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
					currentTime = data['time']
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
            break

		case 'opinion':
            printOpinion(data['likeCount'], data['dislikeCount']);
            break
            
        case 'auth':
            switch (action){
                
                case 'reauth':
                    location.reload();
                    break
                    
                case 'isAdmin':
                    isAdmin(data['admin']);
                    break
            }
            break
        
        case 'session':
            placeAlert('success', data['msg']);
            break
            
        case 'users':
            switch (action){
                case 'countInRoom':
                    showUsersCount(data['usersCount']);
                    
                break
                
                case 'getNickNames':
                    wsOnNicknames(data['nicknames']);
                break
                
                case 'getDislikes':
                    wsOnDislikes(data['dislikes']);
                break
                
            }
            break
            
		default:
			console.log('Error - type = ' + type);
	}
}
