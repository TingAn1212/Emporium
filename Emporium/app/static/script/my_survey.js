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
        document.getElementById("popup_bg").style.display = "flex";
        document.getElementById("popup_box").style.display = "initial";
        document.getElementById("popup_title").innerHTML = title;
        document.getElementById("popup_desc").innerHTML = desc;
        document.getElementById("popup_date").innerHTML = "Posted on: "+date;
        document.getElementById("popup_response").innerHTML = "Responded: "+response;
        document.getElementById("popup_preview").src = link;
        $("#copy_button").css("display","initial");
    }
    function popdown(){
        document.getElementById("popup_box").style.display = "none";
        document.getElementById("popup_bg").style.display = "none";
        document.getElementById("popup_preview").src = "/loading";
    }
    function copy(){
        navigator.clipboard.writeText('https://emporium-neon.vercel.app/view?survey_id='+id);
    }
    function upload(){
        let title = $("#new_title").val();
        let desc = $("#new_desc").val();
        let link = $("#new_link").val();
    }
}