var mode = "N0";
function switch_mode(){
    if (mode == "N0"){
        mode = "N1";
        document.getElementById("switch").innerHTML = "Read";
        const N0 = document.querySelectorAll('.N0');
        N0.forEach(i => {
            i.style.display = 'none';
        });
        const N1 = document.querySelectorAll('.N1');
        N1.forEach(i => {
            i.style.display = 'flex';
        });
    }else{
        mode = "N0";
        document.getElementById("switch").innerHTML = "Unread";
        const N0 = document.querySelectorAll('.N0');
        N0.forEach(i => {
            i.style.display = 'flex';
        });
        const N1 = document.querySelectorAll('.N1');
        N1.forEach(i => {
            i.style.display = 'none';
        });
    }
}

function seen(nid){
    document.getElementById("N"+nid).style.display = "none";
    fetch("/fetch",{
        headers: {
            'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify({action:"seen",id:nid}),
    })
}