// MIT License:
//
// Copyright (c) 2010-2012, Joe Walnes
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
/**
* This behaves like a WebSocket in every way, except if it fails to connect,
* or it gets disconnected, it will repeatedly poll until it successfully connects
* again.
*
* It is API compatible, so when you have:
* ws = new WebSocket('ws://....');
* you can replace with:
* ws = new ReconnectingWebSocket('ws://....');
*
* The event stream will typically look like:
* onconnecting
* onopen
* onmessage
* onmessage
* onclose // lost connection
* onconnecting
* onopen // sometime later...
* onmessage
* onmessage
* etc...
*
* It is API compatible with the standard WebSocket API, apart from the following members:
*
* - `bufferedAmount`
* - `extensions`
* - `binaryType`
*
* Latest version: https://github.com/joewalnes/reconnecting-websocket/
* - Joe Walnes
*
* Syntax
* ======
* var socket = new ReconnectingWebSocket(url, protocols, options);
*
* Parameters
* ==========
* url - The url you are connecting to.
* protocols - Optional string or array of protocols.
* options - See below
*
* Options
* =======
* Options can either be passed upon instantiation or set after instantiation:
*
* var socket = new ReconnectingWebSocket(url, null, { debug: true, reconnectInterval: 4000 });
*
* or
*
* var socket = new ReconnectingWebSocket(url);
* socket.debug = true;
* socket.reconnectInterval = 4000;
*
* debug
* - Whether this instance should log debug messages. Accepts true or false. Default: false.
*
* automaticOpen
* - Whether or not the websocket should attempt to connect immediately upon instantiation. The socket can be manually opened or closed at any time using ws.open() and ws.close().
*
* reconnectInterval
* - The number of milliseconds to delay before attempting to reconnect. Accepts integer. Default: 1000.
*
* maxReconnectInterval
* - The maximum number of milliseconds to delay a reconnection attempt. Accepts integer. Default: 30000.
*
* reconnectDecay
* - The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. Accepts integer or float. Default: 1.5.
*
* timeoutInterval
* - The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. Accepts integer. Default: 2000.
*
*/
(function (global, factory) {
if (typeof define === 'function' && define.amd) {
define([], factory);
} else if (typeof module !== 'undefined' && module.exports){
module.exports = factory();
} else {
global.ReconnectingWebSocket = factory();
}
})(this, function () {
if (!('WebSocket' in window)) {
return;
}
function ReconnectingWebSocket(url, protocols, options) {
// Default settings
var settings = {
/** Whether this instance should log debug messages. */
debug: false,
/** Whether or not the websocket should attempt to connect immediately upon instantiation. */
automaticOpen: true,
/** The number of milliseconds to delay before attempting to reconnect. */
reconnectInterval: 1000,
/** The maximum number of milliseconds to delay a reconnection attempt. */
maxReconnectInterval: 30000,
/** The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. */
reconnectDecay: 1.5,
/** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
timeoutInterval: 2000,
/** The maximum number of reconnection attempts to make. Unlimited if null. */
maxReconnectAttempts: null,
/** The binary type, possible values 'blob' or 'arraybuffer', default 'blob'. */
binaryType: 'blob'
}
if (!options) { options = {}; }
// Overwrite and define settings with options if they exist.
for (var key in settings) {
if (typeof options[key] !== 'undefined') {
this[key] = options[key];
} else {
this[key] = settings[key];
}
}
// These should be treated as read-only properties
/** The URL as resolved by the constructor. This is always an absolute URL. Read only. */
this.url = url;
/** The number of attempted reconnects since starting, or the last successful connection. Read only. */
this.reconnectAttempts = 0;
/**
* The current state of the connection.
* Can be one of: WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED
* Read only.
*/
this.readyState = WebSocket.CONNECTING;
/**
* A string indicating the name of the sub-protocol the server selected; this will be one of
* the strings specified in the protocols parameter when creating the WebSocket object.
* Read only.
*/
this.protocol = null;
// Private state variables
var self = this;
var ws;
var forcedClose = false;
var timedOut = false;
var eventTarget = document.createElement('div');
// Wire up "on*" properties as event handlers
eventTarget.addEventListener('open', function(event) { self.onopen(event); });
eventTarget.addEventListener('close', function(event) { self.onclose(event); });
eventTarget.addEventListener('connecting', function(event) { self.onconnecting(event); });
eventTarget.addEventListener('message', function(event) { self.onmessage(event); });
eventTarget.addEventListener('error', function(event) { self.onerror(event); });
// Expose the API required by EventTarget
this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);
/**
* This function generates an event that is compatible with standard
* compliant browsers and IE9 - IE11
*
* This will prevent the error:
* Object doesn't support this action
*
* http://stackoverflow.com/questions/19345392/why-arent-my-parameters-getting-passed-through-to-a-dispatched-event/19345563#19345563
* @param s String The name that the event should use
* @param args Object an optional object that the event will use
*/
function generateEvent(s, args) {
var evt = document.createEvent("CustomEvent");
evt.initCustomEvent(s, false, false, args);
return evt;
};
this.open = function (reconnectAttempt) {
ws = new WebSocket(self.url, protocols || []);
ws.binaryType = this.binaryType;
if (reconnectAttempt) {
if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
return;
}
} else {
eventTarget.dispatchEvent(generateEvent('connecting'));
this.reconnectAttempts = 0;
}
if (self.debug || ReconnectingWebSocket.debugAll) {
console.debug('ReconnectingWebSocket', 'attempt-connect', self.url);
}
var localWs = ws;
var timeout = setTimeout(function() {
if (self.debug || ReconnectingWebSocket.debugAll) {
console.debug('ReconnectingWebSocket', 'connection-timeout', self.url);
}
timedOut = true;
localWs.close();
timedOut = false;
}, self.timeoutInterval);
ws.onopen = function(event) {
clearTimeout(timeout);
if (self.debug || ReconnectingWebSocket.debugAll) {
console.debug('ReconnectingWebSocket', 'onopen', self.url);
}
self.protocol = ws.protocol;
self.readyState = WebSocket.OPEN;
self.reconnectAttempts = 0;
var e = generateEvent('open');
e.isReconnect = reconnectAttempt;
reconnectAttempt = false;
eventTarget.dispatchEvent(e);
};
ws.onclose = function(event) {
clearTimeout(timeout);
ws = null;
if (forcedClose) {
self.readyState = WebSocket.CLOSED;
eventTarget.dispatchEvent(generateEvent('close'));
} else {
self.readyState = WebSocket.CONNECTING;
var e = generateEvent('connecting');
e.code = event.code;
e.reason = event.reason;
e.wasClean = event.wasClean;
eventTarget.dispatchEvent(e);
if (!reconnectAttempt && !timedOut) {
if (self.debug || ReconnectingWebSocket.debugAll) {
console.debug('ReconnectingWebSocket', 'onclose', self.url);
}
eventTarget.dispatchEvent(generateEvent('close'));
}
var timeout = self.reconnectInterval * Math.pow(self.reconnectDecay, self.reconnectAttempts);
setTimeout(function() {
self.reconnectAttempts++;
self.open(true);
}, timeout > self.maxReconnectInterval ? self.maxReconnectInterval : timeout);
}
};
ws.onmessage = function(event) {
if (self.debug || ReconnectingWebSocket.debugAll) {
console.debug('ReconnectingWebSocket', 'onmessage', self.url, event.data);
}
var e = generateEvent('message');
e.data = event.data;
eventTarget.dispatchEvent(e);
};
ws.onerror = function(event) {
if (self.debug || ReconnectingWebSocket.debugAll) {
console.debug('ReconnectingWebSocket', 'onerror', self.url, event);
}
eventTarget.dispatchEvent(generateEvent('error'));
};
}
// Whether or not to create a websocket upon instantiation
if (this.automaticOpen == true) {
this.open(false);
}
/**
* Transmits data to the server over the WebSocket connection.
*
* @param data a text string, ArrayBuffer or Blob to send to the server.
*/
this.send = function(data) {
if (ws) {
if (self.debug || ReconnectingWebSocket.debugAll) {
console.debug('ReconnectingWebSocket', 'send', self.url, data);
}
return ws.send(data);
} else {
throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
}
};
/**
* Closes the WebSocket connection or connection attempt, if any.
* If the connection is already CLOSED, this method does nothing.
*/
this.close = function(code, reason) {
// Default CLOSE_NORMAL code
if (typeof code == 'undefined') {
code = 1000;
}
forcedClose = true;
if (ws) {
ws.close(code, reason);
}
};
/**
* Additional public API method to refresh the connection if still open (close, re-open).
* For example, if the app suspects bad data / missed heart beats, it can try to refresh.
*/
this.refresh = function() {
if (ws) {
ws.close();
}
};
}
/**
* An event listener to be called when the WebSocket connection's readyState changes to OPEN;
* this indicates that the connection is ready to send and receive data.
*/
ReconnectingWebSocket.prototype.onopen = function(event) {};
/** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
ReconnectingWebSocket.prototype.onclose = function(event) {};
/** An event listener to be called when a connection begins being attempted. */
ReconnectingWebSocket.prototype.onconnecting = function(event) {};
/** An event listener to be called when a message is received from the server. */
ReconnectingWebSocket.prototype.onmessage = function(event) {};
/** An event listener to be called when an error occurs. */
ReconnectingWebSocket.prototype.onerror = function(event) {};
/**
* Whether all instances of ReconnectingWebSocket should log debug messages.
* Setting this to true is the equivalent of setting all instances of ReconnectingWebSocket.debug to true.
*/
ReconnectingWebSocket.debugAll = false;
ReconnectingWebSocket.CONNECTING = WebSocket.CONNECTING;
ReconnectingWebSocket.OPEN = WebSocket.OPEN;
ReconnectingWebSocket.CLOSING = WebSocket.CLOSING;
ReconnectingWebSocket.CLOSED = WebSocket.CLOSED;
return ReconnectingWebSocket;
});

var $wsStatus = $('#wsStatus');
var ws = new ReconnectingWebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.hostname + ':' + window.location.port + '/ws');
ws.onopen = function(){
$wsStatus.attr("class", 'btn btn-success navbar-btn');
};
ws.onclose = function(ev){
var text = '';
if (ev.wasClean){ text = 'disconnected' ;} else { text = 'error'; };
$wsStatus.attr("class", 'btn btn-danger navbar-btn');
};
function waitForSocketConnection(socket, callback){
setTimeout(
function () {
if (socket.readyState === 1) {
if(callback != null){
callback();
}
return;
} else {
waitForSocketConnection(socket, callback);
}
}, 5);
}

var pingStartTime=0;
var latency = 0;
function getLatency(){
pingStartTime = Date.now();
sendMessage(JSON.stringify({type: "ping", action: "ping"}));
return false;
}
setInterval(getLatency, 500);

function getCookie(name) {
var matches = document.cookie.match(new RegExp(
"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
));
return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options) {
options = options || {};
var expires = options.expires;
if (typeof expires == "number" && expires) {
var d = new Date();
d.setTime(d.getTime() + expires * 1000);
expires = options.expires = d;
}
if (expires && expires.toUTCString) {
options.expires = expires.toUTCString();
}
value = encodeURIComponent(value);
var updatedCookie = name + "=" + value;
for (var propName in options) {
updatedCookie += "; " + propName;
var propValue = options[propName];
if (propValue !== true) {
updatedCookie += "=" + propValue;
}
}
document.cookie = updatedCookie;
}
function deleteCookie(name) {
setCookie(name, " ")
}

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
controls: 0,
autoplay: 1,
disablekb: 1,
fs: 0,
iv_load_policy: 3,
modestbranding: 1,
rel: 0,
showinfo: 0,
start: currentTimeOnClient,
},
events: {
'onStateChange' : onPlayerStateChange,
'onReady': StartVideo,
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

function hashCode(str) {
var hash = 0;
for (var i = 0; i < str.length; i++) {
hash = str.charCodeAt(i) + ((hash << 5) - hash);
}
return hash;
}
function intToRGB(i){
var c = (i & 0x00FFFFFF)
.toString(16)
.toUpperCase();
return "00000".substring(0, 6 - c.length) + c;
}
var tagsToReplace = {
'&': '&amp;',
'<': '&lt;',
'>': '&gt;'
};
function replaceTag(tag) {
return tagsToReplace[tag] || tag;
}
function safe_tags_replace(str) {
return str.replace(/[&<>]/g, replaceTag);
}
function chatGetMessage(name, msg){
var username = safe_tags_replace(name);
var usernamecolor = intToRGB(hashCode(username));
var text = '<span style="color: #' + usernamecolor + ';">' + username + '</span>: ' + safe_tags_replace(msg);
$('#chatframe').append('<p>' + text + '</p>');
document.getElementById("chatframe").scrollTop = document.getElementById("chatframe").scrollHeight;
}
function chatSendMessage(){
$msg = $("#chatMsg")
$username = $("#chatUser")
var msg = $msg.val()
var username = $username.val()
$msg.val('');
sendMessage(JSON.stringify({type: "chat", action: 'sendMsg', msg: msg, user: username }));
return false;
}

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

function guid() {
function s4() {
return Math.floor((1 + Math.random()) * 0x10000)
.toString(16)
.substring(1);
}
return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
s4() + '-' + s4() + s4() + s4();
}
function placeAlert(type, msg){
var alertGuid = guid();
var alertText = '<div class="alert alert-' + type + ' alert-dismissible" id="' + alertGuid + '" role="alert" style="display:none;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><p><span id="alertErrorMsg"></span>' + msg + '</p>';
$('#alerts').append(alertText);
$('#'+ alertGuid ).fadeTo(2000, 500).slideUp(500, function(){$('#' + alertGuid).alert('close');});
}

function videoGetQueue(){
sendMessage(JSON.stringify({type: "video", action: "videoGetQueue"}));
return false;
};
function wsOnQueue(data){
var queue = JSON.parse(data);
var tableHead = '<table class="table table-striped table-condensed table-bordered"><tbody>'
var tableTail = '</tbody></table>'
var tableData = ''
if ( Object.keys(queue).length > 0 ){
for (var key = 0; key < Object.keys(queue).length ; key++) {
var item = JSON.parse(queue[key]);
time = parseInt(item['duration'])
tableData += '<tr><td>NaN</td><td>' + item['name'] + ', ' + toFormattedTime(time, true, false) + '</td></tr>'
}
}
else {
var tableData = '<tr><td>Очередь пуста</td></tr>'
}
$('#queue').html(tableHead + tableData + tableTail);
};
videoGetQueue();
setInterval(videoGetQueue, 1000);

function sendMessage(msg){
waitForSocketConnection(ws, function(){
var _msg = JSON.parse(msg);
_msg['userid'] = getCookie('userid');
_msg['sessionid'] = getCookie('sessionid');
dataToSend = JSON.stringify(_msg);
ws.send(dataToSend);
});
}

ws.onmessage = function (evt) {
var data = JSON.parse(evt.data)
var type = data['type']
var action = data['action']
switch (type){
case 'chat':
switch (action){
case 'getMsg':
chatGetMessage(data['name'], data['msg'])
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
break
case 'opinion':
printOpinion(data['likeCount'], data['dislikeCount']);
break
case 'auth':
if (data['action'] == 'reauth'){
location.reload();
}
break
case 'session':
placeAlert('success', data['msg']);
break
default:
console.log('Error - type = ' + type);
}
}

function videoSend(){
$vid = $("input[name='videoid']");
var vid = $vid.val();
console.log(vid);
$vid.val('');
sendMessage(JSON.stringify({id: vid, type: "video", action: "videoAdd"}));
return false;
};
$('#video').submit(videoSend);
function videoGetCurrent(){
sendMessage(JSON.stringify({type: "video", action: "videoGetCurrent"}));
return false;
};
function videoGetNext(){
sendMessage(JSON.stringify({type: "video", action: "videoGetNext"}));
return false;
};
setInterval(videoGetCurrent, 500);
setInterval(videoGetNext, 1000);

