
var svgFilter = d3.select("#svg-filter");
// slider
  var sliderWidth = 500;
  var xYearFirst = d3.scaleLinear()
      .domain([1853, 2015])
      .range([0, sliderWidth])
      .clamp(true);
  var xYearLast = d3.scaleLinear()
      .domain([1853, 2015])
      .range([0, sliderWidth])
      .clamp(true);
  
  var sliderYearFirst = svgFilter.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + 30 + "," + 100 / 2 + ")");
  var sliderYearLast = svgFilter.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + 30 + "," + 200 / 2 + ")");
  
  sliderYearFirst.append("line")
      .attr("class", "track")
      .attr("x1", xYearFirst.range()[0])
      .attr("x2", xYearFirst.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { sliderYearFirst.interrupt(); })
          .on("start drag", function() { setHandle1(xYearFirst.invert(d3.event.x)); }));
  sliderYearLast.append("line")
      .attr("class", "track")
      .attr("x1", xYearLast.range()[0])
      .attr("x2", xYearLast.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { sliderYearLast.interrupt(); })
          .on("start drag", function() { setHandle2(xYearLast.invert(d3.event.x)); }));
  
  sliderYearFirst.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(xYearFirst.ticks(10))
    .enter().append("text")
      .attr("x", xYearFirst)
      .attr("text-anchor", "middle")
      .text(function(d) { return d; });
  var handle1 = sliderYearFirst.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("cx",0)
      .attr("r", 9);
  
  sliderYearLast.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(xYearLast.ticks(10))
    .enter().append("text")
      .attr("x", xYearLast)
      .attr("text-anchor", "middle")
      .text(function(d) { return d; });
  var handle2 = sliderYearLast.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("cx",0)
      .attr("r", 9);

  // move second slider in the begin to demonstrate interactive possibility      
  // sliderYearLast.transition() 
  //     .duration(750)
  //     .tween("hue", function() {
  //       var i = d3.interpolate(0, 400);
  //       return function(t) { setHandle2(xYearFirst.invert(i(t))); };
  //     }); 
  
  function setHandle1(h) {
    //NEEDSWORK:: USE THIS YEAR
    console.log(Math.round(h));
    if (handle2.attr("cx") < xYearFirst(h)) {
      handle1.attr("cx", handle2.attr("cx"));
    } else {
      handle1.attr("cx", xYearFirst(Math.round(h)));
    } 
    //svgFilter.style("background-color", d3.hsl(xYearFirst.invert(handle1.attr("cx")), 0.8, 0.8));
    updateFilterText();
    //console.log("hue1", "cx: ",xYearFirst(h),", year:",h);
  }
  function setHandle2(h) {
    //NEEDSWORK:: USE THIS YEAR
    console.log(Math.round(h));
    if (handle1.attr("cx") > xYearFirst(h)) {
      handle2.attr("cx", handle1.attr("cx"));
    } else {
      handle2.attr("cx", xYearFirst(Math.round(h)));
    } 
    //svgFilter.style("background-color", d3.hsl(xYearFirst.invert(handle2.attr("cx")), 0.8, 0.8));
    updateFilterText();
    //console.log("hue2", "cx: ",xYearFirst(h),", year:",h);
  }
  
  // adding text to svgFilter 
  function updateFilterText() {
    var valA = xYearFirst.invert(handle1.attr("cx"));
    var valB = xYearLast.invert(handle2.attr("cx"));
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
  