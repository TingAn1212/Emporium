var survey_id = -1;
var hidden = [];
let reload = -1;
function reset_counter(){
    reload = -1;
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
    reset_counter();
}
function popdown(){
    let survey_id = id;
    document.getElementById("popup_preview").src = "/loading";
    $("#popup_box").fadeOut(800);
    $("#popup_bg").fadeOut(800);
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
            body: JSON.stringify({action:"add_responds",id:survey_id,user:userid,password:pw}),
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

async function init(){
    //console.log("init running");
    reset_counter();
    let tem = await fetch("/fetch",{
        headers: {
            'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({action:"get_recomm",Sid:userid,Spw:pw}),
    })
    let response = await tem.json();
    for (var survey of response.recomm){
        var item= $('<span data-aos="flip-down" data-aos-offset="60" data-aos-duration="1000" data-aos-once="true" class="survey"></span>');
        var content = `<label class="survey_description" onclick="popup('${survey[2].toUpperCase()}','${survey[6]}','${survey[4]}','${survey[8]}','${survey[1]}','${survey[0]}')" >${survey[2].toUpperCase()}</label>`;
        $(item).append(content);
        $(item).append("<label class=\"report_box\" onclick=\"window.open('https://docs.google.com/forms/d/1YqyF7J5xegl-ji4u-992zLjd4TmRBiX2vmkIdtAbntw/viewform','_blank');\" ><img class=\"report_flag\" src=\"/static/assets/flag.png\"></label>");
        $("body").append(item)
    }
}
