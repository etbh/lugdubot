//Paste this in the browser's console when logged into camarilla-fr.com

var domParser = new DOMParser();
var lastFetched = 0;

function getNewMessages(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET','http://www.camarilla-fr.com/forum/ajaxshoutbox/' + (lastFetched ? ('getAfter/' + lastFetched) : 'getAll'), false);
    xhr.send();
    var messages = JSON.parse(xhr.response);
    if (lastFetched == 0)
        messages = messages.slice(-1);
    if (messages.length > 0)
        lastFetched = messages[messages.length - 1].id;
    return messages;
}

function getMessagesSince(time){
    time = new Date(time);
    var allMessages = [];
    var nextMessages = [];
    while (nextMessages.length == 0 || new Date(nextMessages[0].date) >= time){
        var xhr = new XMLHttpRequest();
        xhr.open('GET','http://www.camarilla-fr.com/forum/ajaxshoutbox/' + (nextMessages.length == 0 ? 'getAll' : ('getBefore/' + nextMessages[0].id) ), false);
        xhr.send();
        var nextMessages = JSON.parse(xhr.response);
        for (var i = nextMessages.length-1; i>=0 && new Date(nextMessages[i].date) >= time; i--){
            allMessages.push(nextMessages[i]);
        }
    }
    return allMessages;
}

function getUser(message){
    var element = domParser.parseFromString(message.user, 'text/html').querySelector('a');
    return {
        name : element.innerText,
        profile : element.href,
    };
}

function getUserCity(user){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', user.profile || user, false);
    xhr.send();
    return domParser.parseFromString(xhr.response, 'text/html').querySelector('#viewprofile .bg1 dd:nth-child(10)').innerText;
}

window.setInterval(function(){
    if (getNewMessages().some(function(entry){
        return entry.message == "lugdubot";
    })){
        console.log('HELLO');
        var xhr = new XMLHttpRequest();
        xhr.open('POST','http://www.camarilla-fr.com/forum/ajaxshoutbox/post', false);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send("text_shoutbox=%5Bsize%3D50%5D%5Bb%5D%5Bcolor%3D%23FF0000%5D%5Bhighlight%3Dyellow%5DLUGDUBOT+IS+ALIVE%5B%2Fhighlight%5D%5B%2Fcolor%5D%5B%2Fb%5D%5B%2Fsize%5D&creation_time="+document.querySelector('[name=creation_time]').value+"&form_token=" + document.querySelector('[name=form_token]').value);
    }
    else
        console.log('GOT NOTHING...');
}, 2000);
