let routeColorHexas;
let routeColor;
let rowLabel; 
let rowId;
let rowNumber;

let prevColLabel;
let colLabel;
let colId;
let colNumber;

let dictColIdIdx;
let dictRowIdIdx;

const colorBuckets = 21;
const colors = ['#005824','#1A693B','#347B53','#4F8D6B','#699F83','#83B09B','#9EC2B3','#B8D4CB','#D2E6E3','#EDF8FB','#FFFFFF','#F1EEF6','#E6D3E1','#DBB9CD','#D19EB9','#C684A4','#BB6990','#B14F7C','#A63467','#9B1A53','#91003F'];
const colorScale = d3.scaleLinear()
	.domain([ 1, 0.5, 0])
	.range(['blue', 'white', 'red']);

const margin = { top: 50, right: 5, bottom: 40, left: 150 };
const cellSizeX=8;
const cellSizeY=8;
const legendElementWidth = cellSizeX*4.5;
const colorEvent = ["#00FF00", "#FFFF00", "#00FFFF", "#FF00FF"];
const colorMultiEvent = "#000000";
const colorNoEvent = "#FFFFFF";


function drawHeatmap(f1, f2, listEventFile){
	d3.select("svg").remove();
	const files = [d3.csv(f1), d3.csv(f2)];
	const promiseFiles = files.concat(listEventFile.map(x=>d3.json(x)))
	Promise.all(promiseFiles).then(function(values){	
		dataEvents = values.slice(2, values.length);
		rowLabel = values[0].map(x => x.stop_name);
		rowId = values[0].map(x => x.stop_id);
		rowNumber = rowLabel.length;
		routeColorHexas	= values[0].map(x => x.route_color_hexa);
		routeColor = values[0].map(x => x.route_color);
		values[0].forEach((x,i) => dictStopIdName[x.stop_id] = x.stop_name);
		values[0].forEach((x,i) => dictStopIdLat[x.stop_id] = x.lat);
		values[0].forEach((x,i) => dictStopIdLon[x.stop_id] = x.lon);
		values[0].forEach((x,i) => dictStopIdLineColorHexa[x.stop_id] = x.route_color_hexa.split('-'));

		if(currVisuTime=='Year'){
			colLabel = dates["year"][currYear]["mm-dd"]
			colId = colLabel.map(x => currYear+"-"+x);
			colNumber = colLabel.length;
		}else{
			colLabel = dates["timestep_list"];
			colId = colLabel;
			colNumber = colLabel.length;
		}
		prevColLabel=colLabel;
		dictColIdIdx = {};
		dictRowIdIdx = {};
		colId.forEach(function(x, i){dictColIdIdx[x] = i;})
		rowId.forEach(function(x, i){dictRowIdIdx[x] = i;})

		let width = cellSizeX*colNumber; // - margin.left - margin.right,
		let height = cellSizeY*rowNumber; // - margin.top - margin.bottom, //gridSize = Math.floor(width / 24),


		//svg element
//		let svg = d3.select("#chart").append("svg")
//			.attr("width", width + margin.left + margin.right)
	//		.attr("height", height + margin.top + margin.bottom)
		//	.append("g").attr("id", "svg")
		//	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		let rowSortOrder=false;
		let colSortOrder=false;

		//rowLabels element
		let rowLabels = d3.select("#chartRowCol").select("#rowLabelDiv").append("svg")
										.attr('width',"100%")
										.attr('height', "100%")
		.append("g")
		.attr('widht',"100%")
		.attr('height', "100%")
		//let rowLabels = svg.append("g")
			.selectAll(".rowLabelg")
			.data(rowLabel)
			.enter()
			.append("text")
			.text(function (d) { 
				if(d.length<23)
					return d; 
				else
					return d.substring(0,22)+'..';
			})
			.attr("x", 0)
			.attr("y", function (d, i) { return i * cellSizeY; })
			.style("text-anchor", "end")
			.attr("transform", "translate("+document.getElementById('rowLabelDiv').offsetWidth+"," + cellSizeY / 1.5 + ")")
			.attr("class", function (d,i) { return "rowLabel mono r"+i;} ) 
			.style("font-size", "9px")
			//.on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
			//.on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
		//.on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r",i,rowSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;});

		//colLabels element
		let colLabels = d3.select("#chartRowCol").select("#chartDiv").append("svg")
		.attr("width",function(){
			if(currVisuTime=='Year'){
				return cellSizeX*dates['year'][currYear]['mm-dd'].length;
			}else{
				return cellSizeX*dates['timestep_list'].length;
			}}).attr("height", "5%")
		.attr('id','colLabelDiv')
		.append("g").attr("id", "colLabel")
		.attr('width',"100%")
		.attr('height', "100%")
		//let colLabels = svg.append("g").attr("id", "colLabel")
			.selectAll(".colLabelg")
			.data(colLabel)
			.enter()
			.append("text")
			.text(function (d, i) { 
				if(currVisuTime=='Year'){
					if((i%1)==0){ return d;}else{ return null;};
				}else{
					if((i%1)==0){ return d.substring(0,5);}{ return null;};
				}
			})
			.attr("x", 0)
			.attr("y", function (d, i) { return i * cellSizeX; })
			.style("text-anchor", "left")
			.attr("transform", "translate("+cellSizeX*0.8 + ","+d3.select("#colLabelDiv").node().getBBox().width/1.6+") rotate (-90)")
			.style("font-size", "9px")
			.attr("class",  function (d,i) { return "colLabel mono c"+i;} )
			.on("mouseover", function(d) {
				if(currVisuTime=='Year') d3.select(this).style('cursor', 'pointer').classed("text-hover",true) ;})
			.on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
			.on("click", function(d,i) {
				//colSortOrder=!colSortOrder;  sortbylabel("c",i,colSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;
				if(currVisuTime=='Year'){
					currVisuTime='Day';
					updateCurrDates(colId[i]);
					document.getElementById("DaySel").click();
				}
			});

		//heatMap element
		let heatMap = d3.select("#chartRowCol").select("#chartDiv")
		.append("svg").attr("id","chartSvg")
		.attr("width",function(){
			if(currVisuTime=='Year'){
				return cellSizeX*dates['year'][currYear]['mm-dd'].length;
			}else{
				return cellSizeX*dates['timestep_list'].length;
			}}).attr("height", "95%")
			.append("g").attr("class","g3")
			.attr("width","100%").attr("height", "100%")
			.attr("id","hmCell")
		//		let heatMap = svg.append("g").attr("class","g3").attr("id","hmCell")
			.selectAll(".cellg")
			.data(values[1], function(d){
				d.stop_id = dictRowIdIdx[d.stop_id];
				d.Datetime = dictColIdIdx[d.Datetime];
				return (d.stop_id+1)+":"+(d.Datetime+1);})
			.enter()
			.append("rect")
			.attr("x", function(d) { return d.Datetime * cellSizeX; })
			.attr("y", function(d) { return d.stop_id * cellSizeY; })
			.attr("class", function(d){ return "cell cell-border cr"+d.stop_id+" cc"+d.Datetime;})
			.attr("width", cellSizeX)
			.attr("height", cellSizeY)
			.attr("id", function(d){return 'x'+d.Datetime+'y'+d.stop_id})
			.style("fill", function(d) {
				let c = getColorCellStroke(colorScale, dataEvents, eventSelection, filterSelection,
					colId[d['Datetime']],rowId[d['stop_id']], d['value'], currVisuTime);
				
				return c[0];
			})


			.on("click", function(d){
				d3.select("#tooltip").classed("hidden", true);
				d3.select("#tooltipmoreinfo")
					.select("#headerMoreInfo")
					.select("#valueHmi")
					.html(function(){
						if (currVisuTime=='Year')
							return getHeaderMoreInfo(dictStopIdName[rowId[d.stop_id]], colId[d.Datetime]);
						else 
							return getHeaderMoreInfo(dictStopIdName[rowId[d.stop_id]], currYmd);
					});
				d3.select("#tooltipmoreinfo")
					.select("#moreInfo")
					.select("#valueTmi")
					.html(function(){
						if (currVisuTime=='Year')
							return getHtmlTooltip(rowId[d.stop_id], colId[d.Datetime], Math.round(d.value * 100) / 100, false);
						else 
							return getHtmlTooltip(rowId[d.stop_id], currYmd, Math.round(d.value * 100) / 100, false);
					});
				d3.select("#tooltipmoreinfo").classed("hidden", false);
				d3.select("#modal").classed("hidden", false);
				if (currVisuTime=='Year')
					drawLineChart(rowId[d.stop_id], colId[d.Datetime]);
				else 
					drawLineChart(rowId[d.stop_id], currYmd);
			})
			.on("mouseover", function(d){
				//highlight text
				d3.select(this).classed("cell-hover",true);
				d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return ri==d.stop_id;});
				d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return ci==d.Datetime;});

				//Update the tooltip position and value
				d3.select("#tooltip")
					.style("left", (d3.event.pageX+10) + "px")
					.style("top", (d3.event.pageY-10) + "px")
					.select("#valueT")
					.html(function(){
						if (currVisuTime=='Year')
							return getHtmlTooltip(rowId[d.stop_id], colId[d.Datetime], Math.round(d.value * 100) / 100);
						else 
							return getHtmlTooltip(rowId[d.stop_id], currYmd, Math.round(d.value * 100) / 100);
					});
				d3.select("#tooltip").classed("hidden", false);})
			.on("mouseout", function(){
				d3.select(this).classed("cell-hover",false);
				d3.selectAll(".rowLabel").classed("text-highlight",false);
				d3.selectAll(".colLabel").classed("text-highlight",false);
				d3.select("#tooltip").classed("hidden", true);});

		function closeTooltipMoreInfo(){d3.select("#tooltipmoreinfo").classed("hidden", true);}

		values[1].forEach(function(d){	
				let c = getColorCellStroke(colorScale, dataEvents, eventSelection, filterSelection,
					colId[d['Datetime']],rowId[d['stop_id']], d['value'], currVisuTime);
			if(c[1]!=colorNoEvent){	
				d3.select("#x"+d.Datetime+"y"+d.stop_id).moveToFront()
					.style("stroke", c[1])
					.style("stroke-width", "2px")
			}
			else{
				d3.select("#x"+d.Datetime+"y"+d.stop_id).moveToBack()
					.style("stroke", c[1])
					.style("stroke-width", "1px")
			}
		})

		//Legend
		//let legend = svg.selectAll(".legend")
		d3.select('#legendSvg').remove();
		let legend = d3.select("#legendChart").append("svg").attr('width',
		
		function(){
			if(currVisuTime=='Year'){
				return Math.min(cellSizeX*dates['year'][currYear]['mm-dd'].length,document.getElementById('chartDiv').offsetWidth);
			}else{
				return Math.min(cellSizeX*dates['timestep_list'].length,document.getElementById('chartDiv').offsetWidth);
			}})
		
		.attr('height','100%').attr('id','legendSvg').selectAll(".legend")
		.append("g").attr("id", "legend")
		.attr('width',"100%")
		.attr('height', "100%")
			.data([-1,-0.9,-0.8,-0.7,-0.6,-0.5,-0.4,-0.3,-0.2,-0.1,0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1])
			.enter().append("g")
			.attr("class", "legend");

		legend.append("rect")
			.attr("x", function(d, i) { return (document.getElementById('legendSvg').getBoundingClientRect().width/21) * i; })
			//.attr("y", height+(cellSizeX*2))
			.attr("y", 0)
			.attr("width", document.getElementById('legendSvg').getBoundingClientRect().width)
			.attr("height", cellSizeX)
			.style("fill", function(d, i) { return colorScale(((-1*d)+1)/2); });

		legend.append("text")
			.attr("class", "mono")
			.text(function(d) { return d; })
			.style('font-size','9px')
			.attr("width", document.getElementById('legendSvg').getBoundingClientRect().width)
			.attr("x", function(d, i) { return (document.getElementById('legendSvg').getBoundingClientRect().width/21) * i+ (document.getElementById('legendSvg').getBoundingClientRect().width/(21*2)); })
			.attr("y", cellSizeX*2);
		//Legend
		//let legend = svg.selectAll(".legend")
//		let legend = d3.select("#legendChart").append("svg").attr('width',
//		
//		function(){
//			if(currVisuTime=='Year'){
//				return Math.min(cellSizeX*dates['year'][currYear]['mm-dd'].length,document.getElementById('chartDiv').offsetWidth);
//			}else{
//				return Math.min(cellSizeX*dates['timestep_list'].length,document.getElementById('chartDiv').offsetWidth);
//			}})
//		
//		.attr('height','100%').attr('id','legendSvg').selectAll(".legend")
//		.append("g").attr("id", "legend")
//		.attr('width',"100%")
//		.attr('height', "100%")
//			.data([-1,-0.9,-0.8,-0.7,-0.6,-0.5,-0.4,-0.3,-0.2,-0.1,0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1])
//			.enter().append("g")
//			.attr("class", "legend");
//
//		legend.append("rect")
//			.attr("x", function(d, i) { return (document.getElementById('legendChart').offsetWidth/21) * i; })
//			//.attr("y", height+(cellSizeX*2))
//			.attr("y", 0)
//			.attr("width", document.getElementById('legendChart').offsetWidth)
//			.attr("height", cellSizeX)
//			.style("fill", function(d, i) { return colorScale(((-1*d)+1)/2); });
//
//		legend.append("text")
//			.attr("class", "mono")
//			.text(function(d) { return d; })
//			.style('font-size','9px')
//			.attr("width", document.getElementById('legendChart').offsetWidth)
//			.attr("x", function(d, i) { return (document.getElementById('legendChart').offsetWidth/21) * i+ (document.getElementById('legendChart').offsetWidth/(21*2)); })
//			.attr("y", cellSizeX*2);

		// Change ordering of cells

		//  function sortbylabel(rORc,i,sortOrder){
		//       var t = svg.transition().duration(3000);
		//       var log2r=[];
		//       var sorted; // sorted is zero-based index
		//       d3.selectAll(".c"+rORc+i) 
		//         .filter(function(ce){
		//            log2r.push(ce.value);
		//          })
		//       ;
		//       if(rORc=="r"){ // sort log2ratio of a gene
		//         sorted=d3.range(col_number).sort(function(a,b){ if(sortOrder){ return log2r[b]-log2r[a];}else{ return log2r[a]-log2r[b];}});
		//         t.selectAll(".cell")
		//           .attr("x", function(d) { return sorted.indexOf(d.col-1) * cellSize; })
		//           ;
		//         t.selectAll(".colLabel")
		//          .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
		//         ;
		//       }else{ // sort log2ratio of a contrast
		//         sorted=d3.range(row_number).sort(function(a,b){if(sortOrder){ return log2r[b]-log2r[a];}else{ return log2r[a]-log2r[b];}});
		//         t.selectAll(".cell")
		//           .attr("y", function(d) { return sorted.indexOf(d.row-1) * cellSize; })
		//           ;
		//         t.selectAll(".rowLabel")
		//          .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
		//         ;
		//       }
		//  }

		//  d3.select("#order").on("change",function(){
		//    order(this.value);
		//  });
		//  
		//  function order(value){
		//   if(value=="hclust"){
		//    var t = svg.transition().duration(3000);
		//    t.selectAll(".cell")
		//      .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
		//      .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; })
		//      ;
		//
		//    t.selectAll(".rowLabel")
		//      .attr("y", function (d, i) { return hcrow.indexOf(i+1) * cellSize; })
		//      ;
		//
		//    t.selectAll(".colLabel")
		//      .attr("y", function (d, i) { return hccol.indexOf(i+1) * cellSize; })
		//      ;
		//
		//   }else if (value=="probecontrast"){
		//    var t = svg.transition().duration(3000);
		//    t.selectAll(".cell")
		//      .attr("x", function(d) { return (d.col - 1) * cellSize; })
		//      .attr("y", function(d) { return (d.row - 1) * cellSize; })
		//      ;
		//
		//    t.selectAll(".rowLabel")
		//      .attr("y", function (d, i) { return i * cellSize; })
		//      ;
		//
		//    t.selectAll(".colLabel")
		//      .attr("y", function (d, i) { return i * cellSize; })
		//      ;
		//
		//   }else if (value=="probe"){
		//    var t = svg.transition().duration(3000);
		//    t.selectAll(".cell")
		//      .attr("y", function(d) { return (d.row - 1) * cellSize; })
		//      ;
		//
		//    t.selectAll(".rowLabel")
		//      .attr("y", function (d, i) { return i * cellSize; })
		//      ;
		//   }else if (value=="contrast"){
		//    var t = svg.transition().duration(3000);
		//    t.selectAll(".cell")
		//      .attr("x", function(d) { return (d.col - 1) * cellSize; })
		//      ;
		//    t.selectAll(".colLabel")
		//      .attr("y", function (d, i) { return i * cellSize; })
		//      ;
		//   }
		//  }
		// 
		//  var sa=d3.select(".g3")
		//      .on("mousedown", function() {
		//          if( !d3.event.altKey) {
		//             d3.selectAll(".cell-selected").classed("cell-selected",false);
		//             d3.selectAll(".rowLabel").classed("text-selected",false);
		//             d3.selectAll(".colLabel").classed("text-selected",false);
		//          }
		//         var p = d3.mouse(this);
		//         sa.append("rect")
		//         .attr({
		//             rx      : 0,
		//             ry      : 0,
		//             class   : "selection",
		//             x       : p[0],
		//             y       : p[1],
		//             width   : 1,
		//             height  : 1
		//         })
		//      })
		//      .on("mousemove", function() {
		//         var s = sa.select("rect.selection");
		//      
		//         if(!s.empty()) {
		//             var p = d3.mouse(this),
		//                 d = {
		//                     x       : parseInt(s.attr("x"), 10),
		//                     y       : parseInt(s.attr("y"), 10),
		//                     width   : parseInt(s.attr("width"), 10),
		//                     height  : parseInt(s.attr("height"), 10)
		//                 },
		//                 move = {
		//                     x : p[0] - d.x,
		//                     y : p[1] - d.y
		//                 }
		//             ;
		//      
		//             if(move.x < 1 || (move.x*2<d.width)) {
		//                 d.x = p[0];
		//                 d.width -= move.x;
		//             } else {
		//                 d.width = move.x;       
		//             }
		//      
		//             if(move.y < 1 || (move.y*2<d.height)) {
		//                 d.y = p[1];
		//                 d.height -= move.y;
		//             } else {
			//                 d.height = move.y;       
		//             }
		//             s.attr(d);
		//      
		//                 // deselect all temporary selected state objects
		//             d3.selectAll('.cell-selection.cell-selected').classed("cell-selected", false);
		//             d3.selectAll(".text-selection.text-selected").classed("text-selected",false);
			//
		//             d3.selectAll('.cell').filter(function(cell_d, i) {
		//                 if(
		//                     !d3.select(this).classed("cell-selected") && 
			//                         // inner circle inside selection frame
		//                     (this.x.baseVal.value)+cellSize >= d.x && (this.x.baseVal.value)<=d.x+d.width && 
		//                     (this.y.baseVal.value)+cellSize >= d.y && (this.y.baseVal.value)<=d.y+d.height
			//                 ) {
		//      
		//                     d3.select(this)
		//                     .classed("cell-selection", true)
		//                     .classed("cell-selected", true);
		//
		//                     d3.select(".r"+(cell_d.row-1))
			//                     .classed("text-selection",true)
		//                     .classed("text-selected",true);
		//
		//                     d3.select(".c"+(cell_d.col-1))
			//                     .classed("text-selection",true)
		//                     .classed("text-selected",true);
		//                 }
		//             });
			//         }
		//      })
		//      .on("mouseup", function() {
		//            // remove selection frame
		//         sa.selectAll("rect.selection").remove();
			//      
		//             // remove temporary selection marker class
		//         d3.selectAll('.cell-selection').classed("cell-selection", false);
		//         d3.selectAll(".text-selection").classed("text-selection",false);
		//      })
		//      .on("mouseout", function() {
		//         if(d3.event.relatedTarget.tagName=='html') {
		//                 // remove selection frame
		//             sa.selectAll("rect.selection").remove();
		//                 // remove temporary selection marker class
		//             d3.selectAll('.cell-selection').classed("cell-selection", false);
			//             d3.selectAll(".rowLabel").classed("text-selected",false);
		//             d3.selectAll(".colLabel").classed("text-selected",false);
		//         }
		//      })
		//      ;
	});
}

let prevVisuTime = currVisuTime;

function updateVisu(currFileName){
	
	d3.csv(currFileName).then(function(data){
		if(currVisuTime=='Year'){
			colLabel = dates["year"][currYear]["mm-dd"]
			colId = colLabel.map(x => currYear+"-"+x);
			colNumber = colLabel.length;
		}else{
			colLabel = dates["timestep_list"];
			colId = colLabel;
			colNumber = colLabel.length;
		}
		dictColIdIdx = {};
		colId.forEach(function(x, i){dictColIdIdx[x] = i;})
		if((prevColLabel==colLabel)){
			data.forEach(function(d){
				
				const c = getColorCellStroke(colorScale, dataEvents, eventSelection, filterSelection,
					d['Datetime'], d['stop_id'], d['value'], currVisuTime);

				if(c[1]!=colorNoEvent){	
					d3.select("#x"+dictColIdIdx[d['Datetime']]+"y"+dictRowIdIdx[d['stop_id']])
						.transition()
						.duration(1000)
						.style("stroke", c[1])
						.style("stroke-width", "2px")
						.style("fill", c[0])
					d3.select("#x"+dictColIdIdx[d['Datetime']]+"y"+dictRowIdIdx[d['stop_id']])
						.moveToFront()
				}
				else{
					d3.select("#x"+dictColIdIdx[d['Datetime']]+"y"+dictRowIdIdx[d['stop_id']])
						.transition()
						.duration(1000)
						.style("stroke", c[1])
						.style("stroke-width", "1px")
						.style("fill", c[0])
					d3.select("#x"+dictColIdIdx[d['Datetime']]+"y"+dictRowIdIdx[d['stop_id']])
						.moveToBack()
				}
			});

		}else{
			prevVisuTime = currVisuTime;
			//colLabels element
			d3.select("#colLabelDiv").remove()
			d3.select("#chartSvg").remove()
		d3.select("#chartRowCol").select("#chartDiv").append("svg")
		.attr("width",function(){
			if(currVisuTime=='Year'){
				return cellSizeX*dates['year'][currYear]['mm-dd'].length;
			}else{
				return cellSizeX*dates['timestep_list'].length;
			}}).attr("height", "5%")
		.attr('id','colLabelDiv')
		.append("g").attr("id", "colLabel")
//			d3.select("#svg").append("g").attr("id", "colLabel")
				.selectAll(".colLabelg")
				.data(colLabel)
				.enter()
				.append("text")
				.text(function (d, i) { 
					if(currVisuTime=='Year'){
						if((i%1)==0){ return d;}else{ return null;};
					}else{
						if((i%1)==0){ return d.substring(0,5);}{ return null;};
					}
				})
				.attr("x", 0)
				.attr("y", function (d, i) { return i * cellSizeX; })
				.style("text-anchor", "left")
				.attr("transform", "translate("+cellSizeX*0.8 + ","+d3.select("#colLabelDiv").node().getBBox().width/1.6+") rotate (-90)")
				//.attr("transform", "translate("+cellSizeX/2 + ",-12) rotate (-90)")
				.style("font-size", "9px")
				.attr("class",  function (d,i) { return "colLabel mono c"+i;} )
				.on("mouseover", function(d) {
				if(currVisuTime=='Year') d3.select(this).style('cursor', 'pointer').classed("text-hover",true);})
				.on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
				.on("click", function(d,i) {
					if(currVisuTime=='Year'){
						currVisuTime='Day';
						updateCurrDates(colId[i]);
						document.getElementById("DaySel").click();
					}
				});

			//heatMap element
			d3.select("#hmCell").remove()
		d3.select("#chartRowCol").select("#chartDiv")
		.append("svg").attr("id","chartSvg")
		.attr("width",function(){
			if(currVisuTime=='Year'){
				return cellSizeX*dates['year'][currYear]['mm-dd'].length;
			}else{
				return cellSizeX*dates['timestep_list'].length;
			}}).attr("height", "95%")
			.append("g").attr("class","g3")
			.attr("width","100%").attr("height", "100%")
			.attr("id","hmCell")
		//	d3.select("#svg").append("g").attr("class","g3").attr("id","hmCell")
				.selectAll(".cellg")
				.data(data, function(d){
					d.stop_id = dictRowIdIdx[d.stop_id];
					d.Datetime = dictColIdIdx[d.Datetime];
					return (d.stop_id+1)+":"+(d.Datetime+1);})
				.enter()
				.append("rect")
				.attr("x", function(d) { return d.Datetime * cellSizeX; })
				.attr("y", function(d) { return d.stop_id * cellSizeY; })
				.attr("class", function(d){ return "cell cell-border cr"+d.stop_id+" cc"+d.Datetime;})
				.attr("width", cellSizeX)
				.attr("height", cellSizeY)
				.attr("id", function(d){return 'x'+d.Datetime+'y'+d.stop_id})
				.style("fill", function(d) {
					const c = getColorCellStroke(colorScale, dataEvents, eventSelection, filterSelection,
					colId[d['Datetime']], rowId[d['stop_id']], d['value'], currVisuTime);
					return c[0];
				})
				/*.style("fill", function(d) { return colorScale(((-1*d.value)+1)/2); })*/
			/* .on("click", function(d) {
										var rowtext=d3.select(".r"+(d.row-1));
										if(rowtext.classed("text-selected")==false){
											rowtext.classed("text-selected",true);
										}else{
											rowtext.classed("text-selected",false);
										}
						})*/
				.on("click", function(d){
					d3.select("#tooltip").classed("hidden", true);
				d3.select("#modal").classed("hidden", false);
					d3.select("#tooltipmoreinfo")
						.select("#headerMoreInfo")
						.select("#valueHmi")
						.html(function(){
							if (currVisuTime=='Year')
								return getHeaderMoreInfo(dictStopIdName[rowId[d.stop_id]], colId[d.Datetime]);
							else 
								return getHeaderMoreInfo(dictStopIdName[rowId[d.stop_id]], currYmd);
						});
					d3.select("#tooltipmoreinfo")
						.select("#moreInfo")
						.select("#valueTmi")
						.html(function(){
							if (currVisuTime=='Year')
								return getHtmlTooltip(rowId[d.stop_id], colId[d.Datetime], Math.round(d.value * 100) / 100, false);
							else 
								return getHtmlTooltip(rowId[d.stop_id], currYmd, Math.round(d.value * 100) / 100, false);
						});
					d3.select("#tooltipmoreinfo").classed("hidden", false);
					if (currVisuTime=='Year')
						drawLineChart(rowId[d.stop_id], colId[d.Datetime], Math.round(d.value * 100) / 100);
					else 
						drawLineChart(rowId[d.stop_id], currYmd, Math.round(d.value * 100) / 100);
				})
				.on("mouseover", function(d){
					//highlight text
					d3.select(this)
						.classed("cell-hover",true);
					d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return ri==d.stop_id;});
					d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return ci==d.Datetime;});

					//Update the tooltip position and value
					d3.select("#tooltip")
						.style("left", (d3.event.pageX+10) + "px")
						.style("top", (d3.event.pageY-10) + "px")
						.select("#valueT")
						.html(function(){
							if (currVisuTime=='Year')
								return getHtmlTooltip(rowId[d.stop_id], colId[d.Datetime], Math.round(d.value * 100) / 100);
							else 
								return getHtmlTooltip(rowId[d.stop_id], currYmd, Math.round(d.value * 100) / 100);
						});
					d3.select("#tooltip").classed("hidden", false);})
				.on("mouseout", function(){
					d3.select(this).classed("cell-hover",false);
					d3.selectAll(".rowLabel").classed("text-highlight",false);
					d3.selectAll(".colLabel").classed("text-highlight",false);
					d3.select("#tooltip").classed("hidden", true);});

			data.forEach(function(d,i){	
					const c = getColorCellStroke(colorScale, dataEvents, eventSelection, filterSelection,
					colId[d['Datetime']], rowId[d['stop_id']], d['value'], currVisuTime);
				if(c[1]!=colorNoEvent){	
					d3.select("#x"+d.Datetime+"y"+d.stop_id).moveToFront()
						.style("stroke", c[1])
						.style("stroke-width", "2px")
				}
				else{
					d3.select("#x"+d.Datetime+"y"+d.stop_id).moveToBack()
						.style("stroke", c[1])
						.style("stroke-width", "1px")
				}
			});



		//Legend
		//let legend = svg.selectAll(".legend")
		d3.select('#legendSvg').remove();
		let legend = d3.select("#legendChart").append("svg").attr('width',
		
		function(){
			if(currVisuTime=='Year'){
				return Math.min(cellSizeX*dates['year'][currYear]['mm-dd'].length,document.getElementById('chartDiv').offsetWidth);
			}else{
				return Math.min(cellSizeX*dates['timestep_list'].length,document.getElementById('chartDiv').offsetWidth);
			}})
		
		.attr('height','100%').attr('id','legendSvg').selectAll(".legend")
		.append("g").attr("id", "legend")
		.attr('width',"100%")
		.attr('height', "100%")
			.data([-1,-0.9,-0.8,-0.7,-0.6,-0.5,-0.4,-0.3,-0.2,-0.1,0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1])
			.enter().append("g")
			.attr("class", "legend");

		legend.append("rect")
			.attr("x", function(d, i) { return (document.getElementById('legendSvg').getBoundingClientRect().width/21) * i; })
			//.attr("y", height+(cellSizeX*2))
			.attr("y", 0)
			.attr("width", document.getElementById('legendSvg').getBoundingClientRect().width)
			.attr("height", cellSizeX)
			.style("fill", function(d, i) { return colorScale(((-1*d)+1)/2); });

		legend.append("text")
			.attr("class", "mono")
			.text(function(d) { return d; })
			.style('font-size','9px')
			.attr("width", document.getElementById('legendSvg').getBoundingClientRect().width)
			.attr("x", function(d, i) { return (document.getElementById('legendSvg').getBoundingClientRect().width/21) * i+ (document.getElementById('legendSvg').getBoundingClientRect().width/(21*2)); })
			.attr("y", cellSizeX*2);
		}//else
		prevColLabel = colLabel;
	});
}


drawHeatmap(csvPath+fileStop, currFileName, fileEvents.map(x=>jsonPath+x));
