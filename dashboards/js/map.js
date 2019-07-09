// Map ------------------

mapboxgl.accessToken = mapboxKey; 
const map = new mapboxgl.Map({
	container: 'map',
	style:'mapbox://styles/flohat32/cjxcz7k5e0p001cmxu3lwehgd',
	center: [-73.6199393861371,45.51991362129638],
	zoom: 10.852080340135252,
	minZoom: 2,
	maxZoom: 17,
	boxZoom:false,
	attributionControl: false,
});

var centerMap= map.getCenter().wrap()
map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
map.addControl(new mapboxgl.NavigationControl(),"top-right");




function switchLayer(layerId) {
	map.setStyle('mapbox://styles/'+layerId)
}


function loadData(stopFile, dataFile, listEventFile){
	const files = [d3.csv(stopFile), d3.csv(dataFile)];
	const promiseFiles = files.concat(listEventFile.map(x=>d3.json(x)))
	Promise.all(promiseFiles).then(function(values){
		dataEvents = values.slice(2, values.length);
		values[0].forEach((x,i) => dictStopIdName[x.stop_id] = x.stop_name);
		values[0].forEach((x,i) => dictStopIdLat[x.stop_id] = x.lat);
		values[0].forEach((x,i) => dictStopIdLon[x.stop_id] = x.lon);
		values[0].forEach((x,i) => dictStopIdLineColorHexa[x.stop_id] = x.route_color_hexa.split('-'));

		values[1].forEach(function(x){
			try{
				currData[x.stop_id][x.Datetime]=x.value;
			}catch(TypeError){
				currData[x.stop_id] = {};
				currData[x.stop_id][x.Datetime]=x.value;
			}
		});

		//convience function for projecting geolocation coordinates
		function project(d) {
			return map.project(getLL(d));
		}
		//convience function for adding projected coordinates to mapbox canvas
		function getLL(d) {
			return new mapboxgl.LngLat(+d.lon, +d.lat)
		}

		// D3 will insert a svg into the map container
		let container = map.getCanvasContainer();
		let svg = d3.select(container).append("svg");


		let dictCurrEventStation = createDictCurrEventStation(currYmd, dataEvents);
		console.log(dictCurrEventStation);
		let dots = svg.selectAll("circle")
			.data(Object.keys(dictStopIdName)).enter()
			.append("circle")
			.attr("class","node")
			.attr("id", function(d){return 'dot'+d})
			.attr("cx", function(d){return map.project([dictStopIdLon[d], dictStopIdLat[d]]).x})
			.attr("cy", function(d){return map.project([dictStopIdLon[d], dictStopIdLat[d]]).y})
			.attr("r", "8px")
			.style('pointer-events', 'all')
			.attr("fill", function(d){
				const v = currData[d][currTimebin];
				return colorScale(((-1*v)+1)/2)
			})
			.attr("stroke-width",function(d){
				let strokeAttr = (getStrokeStrokeWidth(dictCurrEventStation, d, dates['timestep_list'].indexOf(currTimebin)));
				//let color = getColorEvent(currTimebin, d);
				//if(color==colorNoEvent)
				//	return "1px";
				//else
				//	return "5px";
			  return strokeAttr[1];	
			})
			.attr("stroke", function(d){
				let strokeAttr = (getStrokeStrokeWidth(dictCurrEventStation, d, dates['timestep_list'].indexOf(currTimebin)));
				//let color = getColorEvent(currTimebin, d);
				//if(color==colorNoEvent)
				//	return colorScale(((-1*currData[d][currTimebin])+1)/2)
				//else
				//	return getColorEvent(currTimebin, d);
				return strokeAttr[0];
			})
			.attr("stroke-opacity",function(d){
				let strokeAttr = (getStrokeStrokeWidth(dictCurrEventStation, d, dates['timestep_list'].indexOf(currTimebin)));
				return strokeAttr[2]
			})
			.on("click", function(d){
				d3.select("#tooltip").classed("hidden", true);
				d3.select("#tooltipmoreinfo")
					.select("#headerMoreInfo")
					.select("#valueHmi")
					.html(getHeaderMoreInfo(dictStopIdName[d], currYmd));
				d3.select("#tooltipmoreinfo")
					.select("#moreInfo")
					.select("#valueTmi")
					.html(getHtmlTooltip(d, currYmd, Math.round(currData[d][currTimebin]*100)/100, false));
				d3.select("#tooltipmoreinfo").classed("hidden", false);
				d3.select("#modal").classed("hidden", false);
				drawLineChart(d, currYmd);
			})
			.on("mouseover", function(d){
				//Update the tooltip position and value
				d3.select(this)
					.style("cursor", "pointer");
				d3.select("#tooltip")
					.style("left", (d3.event.pageX+10) + "px")
					.style("top", (d3.event.pageY-10) + "px")
					.select("#valueT")
					.html(getHtmlTooltip(d, currYmd, Math.round(currData[d][currTimebin]*100)/100))
				d3.select("#tooltip").classed("hidden", false);})
			.on("mouseout", function(){
				d3.select("#tooltip").classed("hidden", true);});

		function closeTooltipMoreInfo(){d3.select("#tooltipmoreinfo").classed("hidden", true);}

		map.on("move", function(e) {
			Object.keys(dictStopIdName).forEach(function(d){
				d3.select(container).select('svg').select("#dot"+d)
					.attr("cx", map.project([dictStopIdLon[d], dictStopIdLat[d]]).x)
					.attr("cy", map.project([dictStopIdLon[d], dictStopIdLat[d]]).y)			
			})
		});

		map.on("viewreset", function(e) {
			Object.keys(dictStopIdName).forEach(function(d){
				d3.select(container).select('svg').select("#dot"+d)
					.attr("cx", map.project([dictStopIdLon[d], dictStopIdLat[d]]).x)
					.attr("cy", map.project([dictStopIdLon[d], dictStopIdLat[d]]).y)			
			})
		});

		map.on("zoomend", function(e) {
			Object.keys(dictStopIdName).forEach(function(d){
				d3.select(container).select('svg').select("#dot"+d)
					.attr("cx", map.project([dictStopIdLon[d], dictStopIdLat[d]]).x)
					.attr("cy", map.project([dictStopIdLon[d], dictStopIdLat[d]]).y)			
			})
		});

	});
}

loadData(csvPath+fileStop, currFileName, fileEvents.map(x=>jsonPath+x));

function updateVisuTimebin(){
	container = map.getCanvasContainer();
	let dictCurrEventStation = createDictCurrEventStation(currYmd, dataEvents);
	Object.keys(dictStopIdName).forEach(function(d){
		d3.select(container).select('svg').select("#dot"+d)
			.attr("fill", function(d){
				const v = currData[d][currTimebin];
				return colorScale(((-1*v)+1)/2)
			})
//			.attr("stroke-width",function(d){
//				let color = getColorEvent(currTimebin, d);
//				if(color==colorNoEvent)
//					return "1px";
//				else
//					return "5px";
//			})
//			.attr("stroke", function(d){
//				let color = getColorEvent(currTimebin, d);
//				return color;
//			//	if(color==colorNoEvent)
//				//	return colorScale(((-1*currData[d][currTimebin])+1)/2)
//				//else
//					//return getColorEvent(currTimebin, d);
//			});
			.attr("stroke-width",function(d){
				let strokeAttr = (getStrokeStrokeWidth(dictCurrEventStation, d, dates['timestep_list'].indexOf(currTimebin)));
				//let color = getColorEvent(currTimebin, d);
				//if(color==colorNoEvent)
				//	return "1px";
				//else
				//	return "5px";
			  return strokeAttr[1];	
			})
			.attr("stroke", function(d){
				let strokeAttr = (getStrokeStrokeWidth(dictCurrEventStation, d, dates['timestep_list'].indexOf(currTimebin)));
				//let color = getColorEvent(currTimebin, d);
				//if(color==colorNoEvent)
				//	return colorScale(((-1*currData[d][currTimebin])+1)/2)
				//else
				//	return getColorEvent(currTimebin, d);
				return strokeAttr[0];
			})
			.attr("stroke-opacity",function(d){
				let strokeAttr = (getStrokeStrokeWidth(dictCurrEventStation, d, dates['timestep_list'].indexOf(currTimebin)));
				return strokeAttr[2]
			});
	})	
}

function updateVisu(filename){
	d3.csv(filename).then(function(data){
		data.forEach(function(x){
			try{
				currData[x.stop_id][x.Datetime]=x.value;
			}catch(TypeError){
				currData[x.stop_id] = {};
				currData[x.stop_id][x.Datetime]=x.value;
			}
		});
		updateVisuTimebin();
	})
}

