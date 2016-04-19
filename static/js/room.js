function getUsersCount(){
    
    sendMessage(JSON.stringify({type: "users", action: "countInRoom"}));
    
};

setInterval(getUsersCount, 1000);

function showUsersCount(count){
    
    $('#countInRoom').text(count);
    
}
