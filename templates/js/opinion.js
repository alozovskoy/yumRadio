function sendOpinion(opinion){
    sendMessage(JSON.stringify({type: "opinion", action : 'set', opinion: opinion}));
    return false;
};

function checkOpinions(){
    sendMessage(JSON.stringify({type: "opinion", action: "check"}));
    return false;
}

function printOpinion(likeCount, dislikeCount){
    document.getElementById("likeCount").innerHTML = likeCount;
    document.getElementById("dislikeCount").innerHTML = dislikeCount;
    return false;
}

setInterval(checkOpinions, 1000);
