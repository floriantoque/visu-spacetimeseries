function openCloseDatepicker() {
	let x = document.getElementById("calendar");
	if (x.style.display === "none") {
		x.style.display = "block";
		$('#datepicker').show()
	} else {
		$('#datepicker').hide();
		x.style.display = "none";
	}
}


// Create datepicker
const datepicker = $.fn.datepicker.noConflict();
$.fn.bootstrapDP = datepicker;
function updateDatepicker(){
	const dateYearList = dates["year_list"]; 
	let dateMmDd = [];
	dateYearList.forEach(function(x){
		dateMmDd = dateMmDd.concat(dates["year"][x]["mm-dd"])
	});
  let datesEnabled = [];
	dateYearList.forEach(function(x){
		datesEnabled = datesEnabled.concat(dates["year"][x]["mm-dd"].map(y=>x+"-"+y))
	});
	$("#datepicker").bootstrapDP("destroy");
	if(currVisuTime=="Year"){
		$("#datepicker").bootstrapDP({
			format: "yyyy",
			viewMode: "years",
			minViewMode: "years",
			maxViewMode: "years",
			startDate: dateYearList[0],
			endDate: dateYearList[dateYearList.length-1],
		});
	}else{
		$('#datepicker').bootstrapDP({
			format: "yyyy-MM-dd",
			weekStart:1,
			startDate: dateYearList[0]+"-"+dateMmDd[0],
			endDate: dateYearList[dateYearList.length-1]+"-"+dateMmDd[dateMmDd.length-1],
			minViewMode:"days",
			maxViewMode:"years",
			viewMode: "days",
			beforeShowDay: function(date){
			const allDates = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
			if(datesEnabled.indexOf(allDates) != -1)
				return true;
			else
				return false;
			}
		});
	}
	$('#datepicker').bootstrapDP('update', currYmd);
}

updateDatepicker();

$('#datepicker').hide();

// datepicker on click
$('#datepicker').bootstrapDP().on('changeDate', function(ev){
	let ymd = $('#datepicker').data('datepicker').getFormattedDate('yyyy-mm-dd');
	updateCurrDates(ymd);
	$('#datepicker').hide();
	document.getElementById("calendar").style.display = "none";
	updateTimer();
	updateVisu(currFileName);
});



//// TODO understand why it not works directly..
openCloseDatepicker();
openCloseDatepicker();
openCloseDatepicker();

window.addEventListener('click', function(e){
  if (!document.getElementById('timer').contains(e.target)){
		if (document.getElementById("calendar").style.display!="none"){
			document.getElementById("calendar").style.display="none";
		}
	}
});
