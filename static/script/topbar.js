var poped = false;
var userid = window.localStorage.getItem("username");
var pw = window.localStorage.getItem("pass");

function get_width(){
    return screen.width;
}

function get_height(){
    return screen.height;
}

function random_loc(){
    return screen.width*Math.random();
}

async function start_background(){
    while (true){
        await new Promise(r => setTimeout(r, 5));
        if (Math.random() > 0.94){
            let loc = random_loc();
            if (Math.random() > 0.25){
                let new_ele = $("<div class='rain_back' style='left: "+loc+"px !important"+"'></div>");
                $("#background_holder").append(new_ele);
                $(new_ele).animate({"top":get_height()+"px"},7000,function(){this.remove()});
            }else{
                let new_ele = $("<div class='rain_front' style='left: "+loc+"px !important"+"'></div>");
                $("#background_holder").append(new_ele);
                $(new_ele).animate({"top":get_height()+"px"},5000,function(){this.remove()});
            }
        }
    }
}

async function get_points(){
    let tem = await fetch("/fetch",{
        headers: {
            'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({action:"get_points",id:userid}),
    })
    let response = await tem.json();
    return response.point;
}

function login_warn(){
    window.alert("Please log in first");
}

function update(){
    userid = window.localStorage.getItem("username");
    pw = window.localStorage.getItem("pass");
}

async function check_login(){
    let tem = await fetch("/fetch",{
        headers: {
            'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({action:"check_login",id:userid,password:pw}),
    })
    let response = await tem.json();
    return await response.log;
}

async function go(url){
    update();
    if (await check_login()){
        $.redirect(url,{username:userid},"POST");
    }else{
        login_warn();
    }
    
}

async function update_points(){
    let tem = await fetch("/fetch",{
        headers: {
            'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({action:"check_login",id:userid,password:pw}),
    })
    let response = await tem.json();
    if (response.log){
        document.getElementById("points").innerHTML = "Points: "+(await get_points());
    }
}

async function pop(){
    if (poped == false){
        poped = true;
        $("#dropdown").slideDown(1000);
    }else{
        poped = false;
        $("#dropdown").slideUp(1000);
    }
}

function logout(){
    window.localStorage.setItem("username",null);
    window.localStorage.setItem("pass",null);
    window.alert("Logged out")
    location.href = "/home"
}