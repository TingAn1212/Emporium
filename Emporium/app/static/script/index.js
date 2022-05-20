var survey_id = -1;
{
    let reload = -1;
    function reset_counter(){
        reload = -1;
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
        reset_counter();
    }
    function popdown(){
        let survey_id = id;
        document.getElementById("popup_box").style.display = "none";
        document.getElementById("popup_bg").style.display = "none";
        document.getElementById("popup_preview").src = "/loading";
        if (reload > 0){
            fetch("/fetch",{
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "POST",
                body: JSON.stringify({action:"add_point",id:userid,password:pw}),
            })
            fetch("/fetch",{
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "POST",
                body: JSON.stringify({action:"add_responds",id:survey_id}),
            })
            window.alert("Survey completed");
            reset_counter();
            location.reload();
        }else{
            reset_counter();
        }
        
    }
    
    function add(){
        reload += 1;
    }
    
    function go_detail(){
        $.redirect("/view",{survey_id:id},"GET");
    }
}
