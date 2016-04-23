function toFormattedTime(input, withHours, roundSeconds)
{
    if (roundSeconds)
    {
        input = Math.ceil(input);
    }

    var hoursString = '00';
    var minutesString = '00';
    var secondsString = '00';
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    hours = Math.floor(input / (60 * 60));
    input = input % (60 * 60);

    minutes = Math.floor(input / 60);
    input = input % 60;

    seconds = input;

    hoursString = (hours >= 10) ? hours.toString() : '0' + hours.toString();
    minutesString = (minutes >= 10) ? minutes.toString() : '0' + minutes.toString();
    secondsString = (seconds >= 10) ? seconds.toString() : '0' + seconds.toString();

    return ((withHours) ? hoursString + ':' : '') + minutesString + ':' + secondsString;
}

function unixtimeToTime(unixtime){
    var time = new Date(unixtime * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = time.getFullYear();
    var month = months[time.getMonth()];
    var date = time.getDate();
    var hour = time.getHours();
    var min = time.getMinutes();
    var sec = time.getSeconds();
    return date + ' ' + month + ' ' + year + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2) ;
}

function timeToUnixtime(time){
    var parsedTime = new Date(time.replace(/(\d+) (\w+) (\d+) (\d+):(\d+):(\d+)/, '$2 $1, $3 $4:$5:$6'));
    return (parsedTime.getTime() / 1000);
}
