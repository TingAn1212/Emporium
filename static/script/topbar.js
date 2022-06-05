var poped = false;
var userid = window.localStorage.getItem("username");
var pw = window.localStorage.getItem("pass");

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
        let tem = await fetch("/fetch",{
            headers: {
                'Content-Type': 'application/json',
            },
            method: "POST",
            body: JSON.stringify({action:"get_points",id:userid}),
        })
        let response = await tem.json();
        document.getElementById("points").innerHTML = "Points: "+response.point;
    }
}

async function pop(){
    if (poped == false){
        poped = true;
        document.getElementById("dropdown").style.display = "block";
        await new Promise(r => setTimeout(r, 1));
        document.getElementById("dropdown").style.top = "50px";
        document.getElementById("dropdown").style.opacity = 1;
    }else{
        poped = false;
        document.getElementById("dropdown").style.top = "-15px";
        document.getElementById("dropdown").style.opacity = 0;
        await new Promise(r => setTimeout(r, 1200));
        document.getElementById("dropdown").style.display = "none";
    }
}

function logout(){
    window.localStorage.setItem("username",null);
    window.localStorage.setItem("pass",null);
    window.alert("Logged out")
    location.href = "/home"
}