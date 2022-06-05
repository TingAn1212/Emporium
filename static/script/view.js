{
    let reload = -1;
    function copy(){
        navigator.clipboard.writeText(window.location.href);
    }
    function reset(){
        reload = -1;
    }
    function add(){
        reload += 1;
    }
    function check(survey_id){
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
            reset();
            location.href = "/home";
        }else{
            reset();
            location.href = "/home";
        }
    }
}


