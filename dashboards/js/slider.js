const maxTimebin = dates['timestep_list'].length-1;

d3.select("#sliderStyle").append("div").attr("id","slider")
$("#slider").slider({
	value:28,
	min: 0,
	max: maxTimebin,
	step: 1,
	slide: function( event, ui ) {

		currTimebinId = ui.value;
		currTimebin = dates['timestep_list'][currTimebinId];
		updateTimer();
		updateVisuTimebin();
		if(currTimebinId==maxTimebin){
			document.getElementById("play").className="fas fa-redo";
		}
		if((currTimebinId!=maxTimebin)&(document.getElementById("play").className=="fas fa-redo")){
			document.getElementById("play").className="far fa-play-circle";
		}

	}
});



async function play(){
	if(document.getElementById("play").className=="far fa-play-circle"){
		document.getElementById("play").className="far fa-pause-circle";
		onPlay=true;
		while(onPlay==true){
			if (maxTimebin==$('#slider').data("uiSlider").value()){
				document.getElementById("play").className="fas fa-redo";
				return 0;
			}
			await sleep(60);
			uiValue = $('#slider').data("uiSlider").value()+1
			$('#slider').data("uiSlider").value(uiValue)
			currTimebinId	 = $('#slider').data("uiSlider").value();
			currTimebin = dates['timestep_list'][currTimebinId];
			updateTimer();
			updateVisuTimebin();

		}
		return 0;
	}

	if(document.getElementById("play").className=="far fa-pause-circle"){
		document.getElementById("play").className="far fa-play-circle";
		onPlay=false;
		return 0;
	}

	if(document.getElementById("play").className=="fas fa-redo"){
		document.getElementById("play").className="far fa-pause-circle";
		onPlay=true;

		$('#slider').data("uiSlider").value(0)
		currTimebinId	 = $('#slider').data("uiSlider").value();
		currTimebin = dates['timestep_list'][currTimebinId];
		updateTimer();
		updateVisuTimebin();

		while(onPlay==true){
			if (maxTimebin==$('#slider').data("uiSlider").value()){
				document.getElementById("play").className="fas fa-redo";
				return 0;
			}
			await sleep(60);
			uiValue = $('#slider').data("uiSlider").value()+1
			$('#slider').data("uiSlider").value(uiValue)
			currTimebinId	 = $('#slider').data("uiSlider").value();
			currTimebin = dates['timestep_list'][currTimebinId];
			updateTimer();
			updateVisuTimebin();


		}
		return 0;
	}
	return 0;
}
