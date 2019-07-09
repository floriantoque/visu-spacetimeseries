const currVisuTime='Day';
const typeVisu = 'spaceVisu';
const currAggFunction=null;
let currNormFunction = normFunctionName[0];
let currTimebin = dates["timestep_list"][28]; 

let dictStopIdName = {};
let dictStopIdLat = {};
let dictStopIdLon = {};
let dictStopIdLineColorHexa = {};

let currData = {};
let nbTimestepToColor = 16;

const colorEvent = ["#00FF00", "#00FFFF", "#FFFF00", "#FF00FF"];
const colorMultiEvent = "#000000";
const colorNoEvent = "#696969";

const colorBuckets = 21;
const colors = ['#005824','#1A693B','#347B53','#4F8D6B','#699F83','#83B09B','#9EC2B3','#B8D4CB','#D2E6E3','#EDF8FB','#FFFFFF','#F1EEF6','#E6D3E1','#DBB9CD','#D19EB9','#C684A4','#BB6990','#B14F7C','#A63467','#9B1A53','#91003F'];
const colorScale = d3.scaleLinear()
	.domain([ 1, 0.5, 0])
	.range(['blue', 'white', 'red']);

// div residues
if (residuesName.length>1){
let content = createDivContent("residuesSelSpace", residuesName, "Select model", modelsNameTooltip);
replaceContentInContainer("residuesDiv", content);

let residuesSelElem = document.getElementById('residuesSelSpace');
residuesSelElem.onchange = function() {
	currResidues = residuesSelElem.value;
	currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);
	updateVisu(currFileName);
}}

//div norm
if (normFunctionName.length>1){
content = createDivContent("normSelSpace", normFunctionName, "Select normalization", normFunctionNameTooltip);
replaceContentInContainer("normDiv", '<br>'+content);

let normSelElem = document.getElementById('normSelSpace');
normSelElem.onchange = function() {
	currNormFunction= normSelElem.value;
	currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);
	updateVisu(currFileName);
}}

const urlParams = new URLSearchParams(window.location.search);

if(urlParams.get("currYmd")){
	currYmd = urlParams.get("currYmd");
}
if(urlParams.get("currNormFunction")){
	currNormFunction = urlParams.get("currNormFunction");
}
if(urlParams.get("currResidues")){
	currResidues = urlParams.get("currResidues");
}
let currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);
document.getElementById("residuesSelSpace").value = currResidues;
document.getElementById("normSelSpace").value = currNormFunction;
