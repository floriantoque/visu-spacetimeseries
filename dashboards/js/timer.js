//Update innerHTML timer
function updateTimer(){
	if(typeVisu=='timeVisu'){
		if(currVisuTime=="Year"){
			document.getElementById("timer").innerHTML="<span style='color:#FFFFFF'> <h4>"+ currYear +"</h4></span>";
		}else{
			document.getElementById("timer").innerHTML="<span style='color:#FFFFFF'> <h4>"+ stringToDate(currYmd,'yyyy-MM-dd','-')+"</h4></span>";
		}
	}else{
		document.getElementById("timer").innerHTML="<span style='color:#FFFFFF'> <h4>"+ stringToDate(currYmd,'yyyy-MM-dd','-')+"</h4><h3>"+currTimebin+"</h3></span>";
	}
}

updateTimer();
