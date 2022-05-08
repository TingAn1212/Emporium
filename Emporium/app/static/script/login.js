async function login(){
    let userid = document.getElementById("username").value;
    let pw = document.getElementById("password").value;
    let response = await fetch("/fetch",{
        headers: {
            'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({action:"login",id:userid,password:pw}),
    })
    let logged = await response.json();
    if (logged.log){
        window.localStorage.setItem("username",userid);
        window.localStorage.setItem("pass",logged.pw);
        document.getElementById("hint").innerHTML = "You are now logged in as: "+userid;
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    }else{
        document.getElementById("hint").innerHTML = "Wrong username or password!";
    }
}