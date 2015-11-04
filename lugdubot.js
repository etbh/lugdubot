//Paste this in the browser's console when logged into camarilla-fr.com

var lastFetched = 0;

function getNewMessages(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET','http://www.camarilla-fr.com/forum/ajaxshoutbox/' + (lastFetched ? ('getAfter/' + lastFetched) : 'getAll'), false);
    xhr.send();
    var messages = JSON.parse(xhr.response);
    lastFetched = messages[messages.length - 1];
    return messages;
}


window.setInterval(function(){
    var invocation = false;
    if (getNewMessages().some(function(entry){
        return entry.message == "lugdubot";
    })){
        xhr = new XMLHttpRequest();
        xhr.open('POST','http://www.camarilla-fr.com/forum/ajaxshoutbox/post', false);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send("text_shoutbox=%5Bsize%3D50%5D%5Bb%5D%5Bcolor%3D%23FF0000%5D%5Bhighlight%3Dyellow%5DLUGDUBOT+IS+ALIVE%5B%2Fhighlight%5D%5B%2Fcolor%5D%5B%2Fb%5D%5B%2Fsize%5D&creation_time="+document.querySelector('[name=creation_time]').value+"&form_token=" + document.querySelector('[name=form_token]').value);
    }
}, 2000);