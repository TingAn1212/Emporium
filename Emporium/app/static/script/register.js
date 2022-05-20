async function check_unique(name){
    let response = await fetch("/fetch",{
        headers: {
            'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({action:"check_unique",id:name}),
    });
    let check = await response.json();
    if (check.unique){
        return true;
    }else{
        return false;
    }
}

async function register(){
    let name = document.getElementById("username").value;
    let pw1 = document.getElementById("password1").value;
    let pw2 = document.getElementById("password2").value;
    if (pw1 == pw2){
        let uni = await check_unique(name);
        if (uni){
            fetch("/fetch",{
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "POST",
                body: JSON.stringify({action:"register",id:name,pw:pw1}),});
            let response = await fetch("/fetch",{
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "POST",
                body: JSON.stringify({action:"hash",pw:pw1})});
            let pw = await response.json();
            window.localStorage.setItem("username",name);
            window.localStorage.setItem("pass",pw.hashed);
            document.getElementById("username").value = "";
            document.getElementById("password1").value = "";
            document.getElementById("password2").value = "";
            document.getElementById("hint").innerHTML = "Registered, you are now logged in as: "+name;
        }else{
            document.getElementById("hint").innerHTML = "This username is taken";
        }
    }else{
        document.getElementById("hint").innerHTML = "Your passwords does not match";
    }
}