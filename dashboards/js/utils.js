function stringToDate(_date,_format,_delimiter){
	const months = [ "January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December" ];
	const days = ["Sunday","Monday", "Tuesday","Wednesday","Thursday","Friday","Saturday"]

	const formatLowerCase=_format.toLowerCase();
	const formatItems=formatLowerCase.split(_delimiter);
	const dateItems=_date.split(_delimiter);
	const monthIndex=formatItems.indexOf("mm");
	const dayIndex=formatItems.indexOf("dd");
	const yearIndex=formatItems.indexOf("yyyy");
	let month=parseInt(dateItems[monthIndex]);
	month-=1;
	const formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
	return days[formatedDate.getDay()]+", "+formatedDate.getDate()+" "+ months[month]+" "+dateItems[yearIndex];
}

function updateCurrDates(ymd){
	currYmd = ymd;
	currYear = ymd.substring(0,4);
	currMonth = ymd.substring(5,7);
	currDay = ymd.substring(8, ymd.length);
	currMonthEn = dates["year"][currYear]["month_en"][dates["year"][currYear]['mm-dd'].indexOf(currMonth+"-"+currDay)]; 
	currDayEn = dates["year"][currYear]["weekday_en"][dates["year"][currYear]['mm-dd'].indexOf(currMonth+"-"+currDay)]; 
	currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);	
}

d3.selection.prototype.moveToFront = function() {  
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

d3.selection.prototype.moveToBack = function() {  
	return this.each(function() { 
		var firstChild = this.parentNode.firstChild; 
		if (firstChild) { 
			this.parentNode.insertBefore(this, firstChild); 
		} 
	});
};

function createDictCurrEventStation(currYmd, eventData){
	let currDayEventStationCount = {};
	fileEventsName.forEach(function(f,i){
		if(! (i in currDayEventStationCount)){
			currDayEventStationCount[i] = {}
		}
		Object.keys(dictStopIdName).forEach(function(d){
			if(! (d in currDayEventStationCount[i])){
				currDayEventStationCount[i][d] = [];
			}
			if(! (d in eventData[i])){
				dates["timestep_list"].forEach(function(ts, its){
					currDayEventStationCount[i][d].push(0);
				})
			}
			else{
				dates["timestep_list"].forEach(function(ts, its){
					if((currYmd + ' ' + ts) in eventData[i][d]){
						currDayEventStationCount[i][d][its] = 	nbTimestepToColor;
					}
					else{
						if(its==0){
							currDayEventStationCount[i][d][its] = 0;
						}
						else{
							currDayEventStationCount[i][d][its] = Math.max(currDayEventStationCount[i][d][its-1]-1, 0);
						}
					}
				})
			}
		})
	})
	return currDayEventStationCount;
}

function getStrokeStrokeWidth(dictCurrEventStation, stationId, idxTs){
	let strokeOpacity=1;
	let stroke;

	let countEvent = [];
	if(!fileEvents.length){
		return [colorNoEvent, '1px', strokeOpacity];
	}else{
		fileEventsName.forEach(function(i,idx){
			countEvent.push(dictCurrEventStation[idx][stationId][idxTs])
		})
		if(Math.max(...countEvent)==0){
			return [colorNoEvent, '1px', strokeOpacity];
		}else{
			strokeOpacity = Math.round( (Math.max(...countEvent)/nbTimestepToColor) * 10 ) / 10;
			if(countEvent.filter(x=>x>0).length>1){
				stroke = colorMultiEvent;
			}
			else{
				stroke = colorEvent[countEvent.findIndex(x=>x>0)%(colorEvent.length)];
			}
		}
		return [stroke, '8px', strokeOpacity];
	}
}


function getAttrCircleSpace(currDayEventStationCount, timebin, stopId){
  
	return 0;
}

function getColorEvent(datetime, stopId){
	if(dataEvents.length==0){
		return colorNoEvent;
	}
	let listCount;
	if(currVisuTime=="Year"){
		listCount = dataEvents.map(function(x){
			try{ 
				return x[stopId][datetime]['list_event'].length;
			}
			catch(TypeError){
				return 0;
			}
		});
	}else{
		listCount = dataEvents.map(function(x){
			try{
				return x[stopId][currYmd +" "+ datetime]['list_event'].length;
			}
			catch(TypeError){
				return 0;
			}
		});
	}

	let count = 0;
	listCount.forEach(function(x){ if(x>0){count+=1;}});
	if(count==1){
		const index = listCount.findIndex(function(n){
			return n>0;
		});
		return colorEvent[index%colorEvent.length];
	}else{
		if(count>1){
			return colorMultiEvent
		}			
		else{
			return colorNoEvent;
		}
	}
}


function replaceContentInContainer(id, content) {
	let container = document.getElementById(id);
	container.innerHTML = content;
}

function getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction, fileType='residues'){
	let name;
	if(currVisuTime=="Year"){
		name = csvPath+fileType+"_visuyear/"+currYmd.substring(0,4)+"/"+currResidues+"__"+currAggFunction+"__"+currNormFunction+".csv";
	}
	else{
		name = csvPath+fileType+"/"+currYmd.replace(/-/gi,'/')+"/"+currResidues+"__"+currNormFunction+".csv";
	}
	return name;
}

// Div content

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

function createDivContent(id, choices, name, tooltip){
	let content = '<label>'+name+` <i id="qm`+id+`" data-toggle="tooltip" data-placement="right" data-html="true" data-original-title="`+tooltip+`" class="far fa-question-circle"></i>`+'</label>';

	content += `<select id="`+id+`" class="selectpicker">`
	let i;
	for (i = 0; i < choices.length; i++) { 
		content += `<option value="`+ choices[i] + `">`+choices[i]+`</option>`;
	}	
	content += `</select>`;
	

	return content
}

function createTimeDivContent(choices){
	let i;
	let content =`<label class="btn btn-primary active">
		<input type="radio" name="RadioTime" value="`+choices[0]+`Sel" id="`+choices[0]+`Sel" autocomplete="off" checked>` + choices[0] + `</label>`
	for (i = 1; i<choices.length; i++) {
		content += `<label class="btn btn-primary">
			<input type="radio" name="RadioTime" value="`+choices[i]+`Sel" id="`+choices[i]+`Sel" autocomplete="off">` + choices[i] + `</label>`
	}
	return content;
}

function createDivEvent(idSel, fileEventsName, name){
	let options = fileEventsName.concat(['None']);
	let	content = `<label>` + name + `</label>`;
	options.forEach(function(x,i){
	let check = "";
		if(i==0){
			check="checked";
		}
		content += `<div class="form-check">
									<input class="form-check-input" type="radio" name="`+idSel+`" id="`+x+`Sel" value="`+ x+`" `+check+`>
								  <label class="form-check-label" for="`+x+`Sel">`+x+`</label>
								</div>
								`;
	});
	return content
}

function createDivFilter(id, name){
	let contentToggle = `<input id="`+id +`" type="checkbox">`
	let content = `<label>` + name +"  "+contentToggle+ `</label>`;
	return content;
}


function updateSelectionDiv(currVisuTime){
	let content;
	if(currVisuTime=='Year'){
		currAggFunction = aggFunctionName[0];
		document.getElementById('aggDiv').style.display = 'block';
		if (aggFunctionName.length>1){
			content = createDivContent("aggSel", aggFunctionName, "Select aggregation",aggFunctionNameTooltip);
			replaceContentInContainer("aggDiv", '<br>'+content);
			let aggSelElem = document.getElementById('aggSel');
			aggSelElem.onchange = function() {
				currAggFunction= aggSelElem.value;
				currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);
				updateVisu(currFileName);
			}
		}

		currNormFunction = normYearFunctionName[0];
		if(normYearFunctionName.length>1){
		content = createDivContent("normSel", normYearFunctionName, "Select normalization", normYearFunctionNameTooltip);
		replaceContentInContainer("normDiv", '<br>'+content);
		let normSelElem = document.getElementById('normSel');
		normSelElem.onchange = function() {
			currNormFunction= normSelElem.value;
			currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);
			updateVisu(currFileName);
		}}

		document.getElementById('eventDiv').style.display = 'block';
		if(fileEventsName.length){
			content = createDivEvent("eventSel", fileEventsName, 'Select event type')
			replaceContentInContainer("eventDiv", '<br>'+content);
			fileEventsName.concat(["None"]).forEach(function(x){
				if (document.getElementById(x+"Sel").checked){
					eventSelection = x
				}
			});
		}

		document.getElementById('eventDiv').onchange = function(x){
			fileEventsName.concat(["None"]).forEach(function(x){
				if (document.getElementById(x+"Sel").checked){
					eventSelection = x
				}
			});
			console.log('updateVisu ',eventSelection)
			updateVisu(currFileName);
		}
		document.getElementById('filterDiv').style.display = 'inline-block';
		if(fileEventsName.length){
			content = createDivFilter('filterSel', "Filter on event?")
			replaceContentInContainer('filterDiv', '<br>'+content);
			filterSelection = $("#filterSel").is(':checked');
		}
		
		document.getElementById('filterSel').onchange = function(){
			if($("#filterSel").is(':checked')){
				filterSelection=true;
			}else{
				filterSelection=false;
			}
			console.log('updatevisu', filterSelection)
			updateVisu(currFileName);
		};
	}	
	else{
		const element = document.getElementById("aggDiv");
		element.style.display = 'none';
		document.getElementById("eventDiv").style.display = 'none';
		document.getElementById("filterDiv").style.display = 'none';

		currNormFunction = normFunctionName[0]
		if(normFunctionName.length>1){
		content = createDivContent("normSel", normFunctionName, "Select normalization", normFunctionNameTooltip);
		replaceContentInContainer("normDiv", content);

		let normSelElem = document.getElementById('normSel');
		normSelElem.onchange = function() {
			currNormFunction= normSelElem.value;
			currFileName = getNameCurrFile(currVisuTime, currYmd, currResidues, currAggFunction, currNormFunction);
			updateVisu(currFileName);
		}}
	}


$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
}



function getColorCellStroke(colorScale, dataEvents, eventSelection, filterSelection, datetime, stopId, value, currVisuTime){
	let colorCell;
	let colorStroke;
	if(currVisuTime!="Year"){
		colorCell = colorScale(((-1*value)+1)/2);
		colorStroke = getColorEvent(datetime, stopId);
	}else{
		if(filterSelection!=true){
			colorCell = colorScale(((-1*value)+1)/2);
			if(eventSelection!="None"){
				idx = fileEventsName.indexOf(eventSelection);
				if(stopId in dataEvents[idx] && datetime in dataEvents[idx][stopId]){
					colorStroke=colorEvent[0];
				}else{
					colorStroke=colorNoEvent;
				}
			}else{
				colorStroke = colorNoEvent;
			}	
		}else{
			if(eventSelection=="None"){
				colorCell=colorNoEvent;
				colorStroke=colorNoEvent;
			}else{
				idx = fileEventsName.indexOf(eventSelection);
				if(stopId in dataEvents[idx] && datetime in dataEvents[idx][stopId]){
					colorCell = colorScale(((-1*value)+1)/2);
					colorStroke = colorEvent[0];
				}else{
					colorCell = colorNoEvent;
					colorStroke = colorNoEvent;
				}
			}
		}
	}
	return [colorCell,colorStroke];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function getTableEvent(de, ymd, stopId){
	let table = `<div class="table-responsive">`;
	table += "<table id='tablePreview' class='table table-striped table-hover table-sm table-bordered'>"+
			 "<thead><tr>"
	Object.keys(de[stopId][ymd]["list_event"][0]).forEach(function(x){
		table += "<th style='font-size:12px;'>"+x+"</th>";
	})
	table += "</tr></thead><tbody>"
	de[stopId][ymd]["list_event"].forEach(function(x,i){
		table += "<tr>"
		Object.values(de[stopId][ymd]["list_event"][i]).forEach(function(xx,ii){
			table += "<td style='font-size:12px;'>"+xx+"</td>";
		})
		table += "</tr>";
	})
	table += "</tbody></table></div>";
	return table;	
}

function getHeaderMoreInfo(stopName, ymd, basicTooltip=false){
	let text = "<center><h5>"+stopName+"<br>"+stringToDate(ymd,'yyyy-mm-dd','-')+"</h5></center>" 
	let normFunction = normFunctionName[0];
	if(typeVisu=='timeVisu' && basicTooltip==false){
		if(currVisuTime=="Day"){
			 normFunction = currNormFunction;
		}
		text += `<button type="button" class="btn btn-secondary" id="switchToSpaceVisu" onclick=window.open("../space-visualization.html?currYmd=`+ymd+`&currNormFunction=`+normFunction+
						`&currResidues=`+currResidues+
						`")>Go to space visualization</button>`; 
	}
	return text;
}

function getHtmlTooltip(stopId, ymd, value, basicTooltip=true){
	let countEvent = "";

	if(fileEvents.length>0){
		fileEventsName.forEach(function(x,i){
			if(basicTooltip){
				try{
					countEvent += x+" count: "+dataEvents[i][stopId][ymd]["list_event"].length+"<br>";
				}catch(TypeError){
					countEvent += x+" count: 0<br>";
				}
			}else{
				try{
					countEvent += x+" count: "+dataEvents[i][stopId][ymd]["list_event"].length+"<br>";
					countEvent += getTableEvent(dataEvents[i], ymd, stopId);
				}catch(TypeError){
					countEvent += x+" count: 0<br>";
				}
			}
		})
	}
	if(basicTooltip){
		let text = getHeaderMoreInfo(dictStopIdName[stopId], ymd, true)
		text += "Residue value: "+value+"<br>";
		text += countEvent;
		text += "<font size='0.7'>(For more information click on the cell)</font>";
		return text;
	}else{
		return countEvent;
	}
}


function drawLineChart(stopId, ymd){
	d3.select("#lineChartSvg").remove()
	const pathObservation = csvPath+'observation/'+ymd.split('-')[0]+'/'+ymd.split('-')[1]+'/'+ymd.split('-')[2]+'/'+'/observation.csv';
	const pathPreds = predsName.map(x=>csvPath+'preds/'+ymd.split('-')[0]+'/'+ymd.split('-')[1]+'/'+ymd.split('-')[2]+'/'+x+'.csv');
	const promiseFiles = [pathObservation].concat(pathPreds).map(x=>d3.csv(x));
	Promise.all(promiseFiles).then(function(values){

		const w = document.getElementById('lineChart').offsetWidth;
		const h = document.getElementById('lineChart').offsetHeight;
		const margin = {top: 30, right: 20, bottom: 70, left: 50},
			width = w - margin.left - margin.right,
			height = h - margin.top - margin.bottom;

		const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
		const x = d3.scaleTime().range([0, width]);
		const y = d3.scaleLinear().range([height, 0]);

		const line = d3.line()
			.x(function(d){return x(d.Datetime);})
			.y(function(d){return y(d.value);});

		const svg = d3.select("#lineChart")
			.append("svg")
			.attr("id", "lineChartSvg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");
		
		// Data shapping 
		values = values.map((x,i)=>x.filter(y=>y.stop_id==stopId).map(function(y){
			return {'Datetime': parseDate(ymd + " " + y.Datetime), 'stop_id':y.stop_id, 'value':parseFloat(y.value), 'key':i}
		}));
		let data = [];
		values.forEach(function(x){data = data.concat(x)});

		x.domain(d3.extent(data, function(x){return x.Datetime}));
		y.domain([0, d3.max(data, function(x){return x.value})]);

		const colors = d3.schemeCategory10;
		const legendSpace = width/values.length;;

		let dataNest = d3.nest()
			.key(function(d){return d.key;})
			.entries(data);

		dataNest.forEach(function(d,i){
			svg.append("path")
				.attr("class", "line")
				.style("stroke", function() { return colors[i]; })
				.attr("id", 'tag'+i) // assign an ID
				.attr("d", function(){
					return line(d.values);
				});

			// Add the Legend
			svg.append("text")
				.attr("x", (legendSpace/2)+i*legendSpace)  // space legend
				.attr("y", height + (50/2)+ 5)
				.attr("class", "legend")    // style the legend
				.style("fill", function() { return  colors[i]; })
				.on("click", function(){
					
					// Determine if current line is visible
					var active   = d.active ? false : true,
						newOpacity = active ? 0 : 1;
					// Hide or show the elements based on the ID
					d3.select("#tag"+i)
						.transition().duration(100)
						.style("opacity", newOpacity);
					// Update whether or not the elements are active
					d.active = active;
				})
				.on("mouseover", function(){
					d3.select(this)
						.style("cursor", "pointer");})
				.text(['observation'].concat(predsName)[i]);
		});

		// Add the X Axis
		svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		// Add the Y Axis
		svg.append("g")
			.attr("class", "axis")
			.call(d3.axisLeft(y));

	})
}
