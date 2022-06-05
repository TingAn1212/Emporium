async function change(name){
    if (await check_login()){
        let old_password = document.getElementById("password1").value;
        let new1 = document.getElementById("password2").value;
        let new2 = document.getElementById("password3").value;
        if (new1 == new2){
            let tem = await fetch("/fetch",{
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "POST",
                body: JSON.stringify({action:"login",id:name,password:old_password}),
            })
            let response = await tem.json();
            if (await response.log){
                await fetch("/fetch",{
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: "POST",
                    body: JSON.stringify({action:"change",username:name,opassword:old_password,npassword:new1}),
                })
                let response = await fetch("/fetch",{
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: "POST",
                    body: JSON.stringify({action:"hash",pw:new1})});
                let pw = await response.json();
                window.localStorage.setItem("pass",pw.hashed);
                document.getElementById("password1").value = "";
                document.getElementById("password2").value = "";
                document.getElementById("password3").value = "";
                document.getElementById("hint").innerHTML = "Successful"
            }else{
                document.getElementById("hint").innerHTML = "Password wrong";
            }
        }else{
            document.getElementById("hint").innerHTML = "New passwords do not match";
        }
    }else{
        document.getElementById("hint").innerHTML = "Error";
    }
}