//Paste this in the browser's console when logged into camarilla-fr.com

var forum = 'http://www.camarilla-fr.com/forum/';
var shoutbox = forum + 'ajaxshoutbox/';
var messagePrefix = "[shadow=blue][color=#000080][font=Lucida Console]";
var messageSuffix = "[/font][/color][/shadow]";

var domParser = new DOMParser();
var lastFetched = 0;

function getNewMessages(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', shoutbox + (lastFetched ? ('getAfter/' + lastFetched) : 'getAll'), false);
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
    while (nextMessages.length == 0 || new Date(nextMessages[nextMessages.length-1].date) >= time){
        var xhr = new XMLHttpRequest();
        xhr.open('GET',shoutbox + (nextMessages.length == 0 ? 'getAll' : ('getBefore/' + nextMessages[nextMessages.length-1].id) ), false);
        xhr.send();
        var nextMessages = JSON.parse(xhr.response);
        for (var i = 0; i<nextMessages.length && new Date(nextMessages[i].date) >= time; i++){
            allMessages.push(nextMessages[i]);
        }
    }
    return allMessages;
}

function getUser(message){
    var element = domParser.parseFromString(message.user, 'text/html').querySelector('a');
    return {
        name : element.textContent,
        profile : element.href,
    };
}

function getActiveUsersSince(time){
    return getMessagesSince(time)
        .map(getUser)
        .sort(function(user1,user2){return user1.name < user2.name ? -1 : 1;})
        .filter(function(user, i, users){return i == 0 || users[i-1].name != user.name;});
}


function getUserCity(user){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', user.profile || user, false);
    xhr.send();
    return [].filter.call(domParser.parseFromString(xhr.response, 'text/html').querySelectorAll('#viewprofile .bg1 dt'), function(dt){
        return dt.textContent == "Ville :";
    })[0].nextElementSibling.textContent;
}

function sendMessage(text){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', shoutbox + 'post');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send("text_shoutbox=" + encodeURI(messagePrefix + text + messageSuffix) + "&creation_time="+document.querySelector('[name=creation_time]').value+"&form_token=" + document.querySelector('[name=form_token]').value);
}

var triggers = [];

function onMessageMatch(predicate, callback){
    triggers.push({
        'predicate' : predicate,
        'callback' : callback
    });
}

function onMessageMatchRegex(regex, callback){
    onMessageMatch(function(entry){
        return entry.message.search(regex) != -1;
    },callback);
}


onMessageMatchRegex("^\/?[Ll]ugdubot$", function(){
    var users = getActiveUsersSince(Date.now() - 1200000);
    console.log(users.map(function(user){return user.name;}));
    var userCities = users.map(getUserCity);
    var rhonalpinsRatio = userCities.filter(function(city){
        return city === "Lyon" || city === "Grenoble"}
    ).length / userCities.length;
    sendMessage("Sur " + users.length + " utilisateurs actifs, " + Math.round(100*rhonalpinsRatio) + "% sont Rhônalpins.");
});

window.setInterval(function(){
    getNewMessages().forEach(function(entry){
        triggers
            .filter(function(trigger){return trigger.predicate(entry);})
            .forEach(function(trigger){trigger.callback(entry);});
    });
}, 2000);
