//Paste this in the browser's console when logged into camarilla-fr.com
window.setInterval(function(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET','http://www.camarilla-fr.com/forum/ajaxshoutbox/getAll', false);
    xhr.send();
    var invocation = false;
    JSON.parse(xhr.response).forEach(function(entry){
        if (entry.message == "lugdubot"){
            console.log("GOT IT !!!");
            invocation = true;
        }
    });
    if (invocation){
        xhr = new XMLHttpRequest();
        xhr.open('POST','http://www.camarilla-fr.com/forum/ajaxshoutbox/post', false);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send("text_shoutbox=%5Bsize%3D150%5D%5Bb%5D%5Bcolor%3D%23FF0000%5D%5Bhighlight%3Dyellow%5DLUGDUBOT+IS+ALIVE%5B%2Fhighlight%5D%5B%2Fcolor%5D%5B%2Fb%5D%5B%2Fsize%5D&creation_time="+document.querySelector('[name=creation_time]').value+"&form_token=" + document.querySelector('[name=form_token]').value);
        invocation = false;
    }
}, 2000);