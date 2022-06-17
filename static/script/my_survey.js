{   let id = -1;
    let state = 0;
    function change(control){
        if (control==1){
            state = 1;
            $("#survey_holder").css("display","none");
            $("#new_holder").css("display","initial");
            $("#left").css("background","#406e8e");
            $("#right").css("background","#305976");
        }else{
            state = 0;
            $("#survey_holder").css("display","initial");
            $("#new_holder").css("display","none");
            $("#left").css("background","#305976");
            $("#right").css("background","#406e8e");
        }
    }
    function popup(title,desc,date,response,link,id_in){
        id = id_in;
        if (mobile()){
            $("#popup_box").css("left","0px");
            $("#popup_box").css("width","100%");
        }
        document.getElementById("popup_title").innerHTML = title;
        document.getElementById("popup_desc").innerHTML = desc;
        document.getElementById("popup_date").innerHTML = "Posted on: "+date;
        document.getElementById("popup_response").innerHTML = "Responded: "+response;
        document.getElementById("popup_preview").src = link;
        $("#popup_box").fadeIn(800);
        $("#popup_bg").fadeIn(800);
        $("#copy_button").css("display","initial");
    }
    function popdown(){
        document.getElementById("popup_preview").src = "/loading";
        $("#popup_box").fadeOut(800);
        $("#popup_bg").fadeOut(800);
    }
    function copy(){
        navigator.clipboard.writeText('https://emporium-neon.vercel.app/view?survey_id='+id);
    }
    function check(src){
        if (src.length > 17){
            if (src.substring(0,34) == "https://docs.google.com/forms/d/e/"){
                return true;
            }else if (src.substring(0,17) == "https://forms.gle"){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    function refresh(){
        let new_src = $("#new_link").val();
        $("#preview").attr("src",new_src);
    }
}
function replace_all(source,check,neww){
    while (source.search(check) > -1){
        source = source.replace(check,neww);
    }
    return source;
}

async function upload(){
    let t = replace_all($("#new_title").val(),"'",'"');
    let d = replace_all($("#new_desc").val(),"'",'"');
    let link = $("#new_link").val();
    if (check(link)){
        if ((await get_points()) > 0){
            let response = await fetch("/fetch",{
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "POST",
                body: JSON.stringify({action:"create_survey",title:t,desc:d,src:link,author:localStorage.getItem("username")})});
            let content = await response.json();
            if (content.state == "true"){
                window.alert(content.reply);
                location.reload(); 
            }else{
                $("#warning_content").html(content.reply);
                $("#warning").css("display","flex");
            }
        }else{
            $("#warning_content").html("Not enough points")
            $("#warning").css("display","flex");
        }
        
    }else{
        $("#warning_content").html("Invalid link")
        $("#warning").css("display","flex");
    }
}