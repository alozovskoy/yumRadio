function sendOpinion(opinion){
    sendMessage(JSON.stringify({type: "opinion", opinion: opinion}));
    return false;
};
