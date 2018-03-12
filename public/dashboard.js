function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function user(){
    if (getCookie(user)){
        return JSON.parse(getCookie(user))
    }
    else return;
}
$(document).ready(function(){
    $.get("/user").then(function(data){
        $("#username").text(data.username)
        $("#avatar").attr("src","https://cdn.discordapp.com/avatars/"+data.id+"/"+data.avatar)
        console.log(data)
        document.cookie = "user="+JSON.stringify(data);
        return data;
    })
    .then(function(user){
        $.get("/guilds").then(function(data){
            $.get("/campaigns").then(function(campaigns){
                data.forEach(function(server){
                    if (campaigns[server.id]){
                        Object.keys(campaigns[server.id]).forEach(function(channelID){
                            var campaign = campaigns[server.id][channelID];
                            var playerIDs = Object.keys(campaign.characters); 
                            var isDM = (campaign.dm==user.id)
                            var isPlayer = (playerIDs.indexOf(user.id)!=-1)
                            console.log(playerIDs);
                            if (isDM || isPlayer){
                                var li = $("<li>").text(campaign.name).attr("sID",server.id).attr("cID",channelID);
                                if (isDM) li.html(li.html()+" <b>DM</b>")
                                $("#campaigns").append(li)
                            }
                        })
                    }
                })
            })
        });
    });
});