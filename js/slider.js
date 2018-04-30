function setupSlider(v1, v2, updateGraph){

sliderVals=[v1, v2],
    sWidth = 500,
    svg = d3.select(".slider-holder").append("svg")
      .attr('width', sWidth+30)
      .attr('height', 50);

x = d3.scaleLinear()
    .domain([1851, 2016])
    .range([0, sWidth])
    .clamp(true);

var xMin=x(1851),
    xMax=x(2016)

slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(5,20)");

slider.append("line")
    .attr("class", "track")
    .attr("x1", 10+x.range()[0])
    .attr("x2", 10+x.range()[1])

selRange = slider.append("line")
    .attr("class", "sel-range")
    .attr("x1", 10+x(sliderVals[0]))
    .attr("x2", 10+x(sliderVals[1]))

slider.insert("g", ".track-overlay")
    .attr("id", "ticks")
    .attr("transform", "translate(10,24)")
  .selectAll("text")
  .data(x.ticks(10))
  .enter().append("text")
    .attr("x", x)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    //.style("fill", function(x){return color(x);})
    .text(function(d) { return d; });

handle = slider.selectAll("rect")
  .data([0, 1])
  .enter().append("rect", ".track-overlay")
    .attr("class", "handle")
    .attr("y", -8)
    .attr("x", function(d) { return x(sliderVals[d]); })
    .attr("rx", 3)
    .attr("height", 16)
    .attr("width", 20)
    .call(
        d3.drag()
          .on("start drag", startDrag)
          .on("drag", drag)
          .on("end", endDrag)
    );


function startDrag(){
  d3.select(this).raise().classed("active", true);
}

function drag(d){
  var x1=d3.event.x;

  //TODO: dragging can pull off edge
  // if(x1>xMax){
  //   x1=xMax
  // }else if(x1<xMin){
  //   x1=xMin
  // }
  d3.select(this).attr("x", x1);
  var x2=x(sliderVals[d==0?1:0])
  selRange
      .attr("x1", 10+x1)
      .attr("x2", 10+x2)

  //Update html
  var v=Math.round(x.invert(d3.event.x))
  var elem=d3.select(this)
  sliderVals[d] = v
  var v1=Math.min(sliderVals[0], sliderVals[1]),
      v2=Math.max(sliderVals[0], sliderVals[1]);

  var valA = v1;
  var valB = v2;
  var curText = "";
  if (valA == valB) {
    curText = "["+valA+"]";
  } else if (valA < valB) {
    curText = "["+valA+"-"+valB+"]";
  } else if (valA > valB) {
    curText = "]"+valA+"-"+valB+"[";
  }
  d3.select("#years-range").text(curText);

}

function endDrag(d){
  var v=Math.round(x.invert(d3.event.x))
  var elem=d3.select(this)
  sliderVals[d] = v
  var v1=Math.min(sliderVals[0], sliderVals[1]),
      v2=Math.max(sliderVals[0], sliderVals[1]);
  elem.classed("active", false)
    .attr("x", x(v));
  selRange
      .attr("x1", 10+x(v1))
      .attr("x2", 10+x(v2))

  updateGraph(v1, v2); 
}

}


