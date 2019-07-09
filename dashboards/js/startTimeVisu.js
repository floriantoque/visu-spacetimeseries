//const timeChoice = ['Day', 'Year'];
const timeChoice = ['Year', 'Day'];
let currVisuTime = timeChoice[0];
const typeVisu = 'timeVisu';

let currAggFunction = aggFunctionName[0];
let currNormFunction;
if(currVisuTime=="Year"){
	currNormFunction = normYearFunctionName[0];
}
else{
	currNormFunction = normFunctionName[0];
}

let dictStopIdName = {};
let dictStopIdLat = {};
let dictStopIdLon = {};
let dictStopIdLineColorHexa = {};

let eventSelection;;
let filterSelection;

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
let currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);

if(residuesName.length>1){
let content = createDivContent("residuesSel", residuesName, "Select model", modelsNameTooltip);
replaceContentInContainer("residuesDiv", content);}

let contentTime = createTimeDivContent(timeChoice);
replaceContentInContainer("timeDiv", contentTime);

updateSelectionDiv(currVisuTime);

if(residuesName.length>1){
let residuesSelElem = document.getElementById('residuesSel');
residuesSelElem.onchange = function() {
	currResidues = residuesSelElem.value;
	currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);
	updateVisu(currFileName);
}}

for (i=0 ; i<timeChoice.length ; i++){
	document.getElementById(timeChoice[i]+"Sel").onchange = function(){
		for (j=0 ; j<timeChoice.length ; j++){
			if(document.getElementById(timeChoice[j]+"Sel").checked){
				currVisuTime = timeChoice[j];
			}
		}
		updateSelectionDiv(currVisuTime);	
		currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);
		updateVisu(currFileName);

		updateTimer();
		updateDatepicker();
	}
}
