ws.onmessage = function (evt) {
    var data = JSON.parse(evt.data)
     
    var type = data['type']
	var action = data['action']
	
	switch (type){
				
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
					
				case 'currentvideo':
					$('#current').text(data['videoid'])
					currentVideoOnServer = data['videoid']
					currentTimeOnServer = data['time']
					break				
					
				case 'getQueue':
					wsOnQueue(data['queue'])
					break
								
				default:
					console.log('Error in video - action = ' + action)
			}
			break
                     
        case 'auth':
            if (data['action'] == 'reauth'){
                location.reload();
            }
            break
                        
        case 'users':
            console.log('USEERS: ' + data['action']);
            switch (action){
                
                case 'getUsers':
                    wsOnUsers(data['users']);
                    break  
                    
                case 'getBan':
                    wsOnBan(data['ban']);
                    break
            }
            break 
                      
		default:
			console.log('Error - type = ' + type);
	}
}
