console.log(root);

var dataByState = bucketByState(root);
//console.log(dataByState);
// var filteredData = filterByYear(dataByState, 1990, 1992);
// //console.log(filteredData);
var svg = d3.select("svg");

// SETTING ORDINAL COLORS
var quantize = d3.scaleQuantize()
  .domain([ 0, 120])
  .range(d3.range(8).map(function(i) { return "q" + i + "-8"; }));

var svg = d3.select("svg");

svg.append("g")
  .attr("class", "legendQuant")
  .attr("transform", "translate(900,250)");

var legend = d3.legendColor()
  .labelFormat(d3.format(".0f"))
  .useClass(true)
  .title("Aggregate Total of Hurricanes")
  .titleWidth(100)
  .scale(quantize);

svg.select(".legendQuant")
  .call(legend);

console.log(legend);
// MAP

var path = d3.geoPath();

// pie chart tooltip


var width = 200;
var text = "";
var height = 200;
var data1 = [
  {name: "Category 1", value: 0},
  {name: "Category 2", value: 0},
  {name: "Category 3", value: 0},
  {name: "Category 4", value: 0},
  {name: "Category 5", value: 0},
];
var color1 = d3.scaleOrdinal(d3.schemeCategory10);
var radius = 100;

var div = d3.select("body").append("div") 
    .attr("id", "tooltip")       
    .style("opacity", 0);

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  svg.append("g")
      .attr("class", "states")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", function(d) {
        var length = (dataByState.find(function(element) {return element.sid == d.id;})).hurricanes.length;
        if (length > 0)
          return quantize(length) + " state"});

  svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

  svg.selectAll("path")
      .on("mouseover", function(d) {
        showToolTip(d, dataByState);
  
        var state_obj = (dataByState.find(function(element) {return element.sid == d.id;})).hurricanes;
        
        for (var i = 0; state_obj.length > i; i++){
          if (state_obj[i].category == 1){
            data1[0].value += 1;

          } else if (state_obj[i].category == 2){
            data1[1].value += 1;

          } else if (state_obj[i].category == 3){
            data1[2].value += 1;

          } else if (state_obj[i].category == 4){
            data1[3].value += 1;

          } else if (state_obj[i].category == 5){
            data1[4].value += 1;

          }
        }
        //console.log(data1);
        var pie_svg = d3.select(".chart").append("svg")
            .attr("class", "pie")
            .style("width", width)
            .style("height", height);
            
        // TODO: Add title to Pie Chart    
        // pie_svg.append("text")
        //     .attr("x", width / 2 )
        //     .attr("y", 0)
        //     .style("text-anchor", "middle")
        //     .text("Title of Diagram");

        var g_pie = pie_svg.append('g')
        .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

        var arc = d3.arc()
          .innerRadius(0)
          .outerRadius(radius);

        var pie = d3.pie()
          .value(function(d) {return d.value; })
          .sort(null);

        //console.log("this is", this);

        var g_pie_slice = g_pie.selectAll('g')
          .data(pie(data1))
          .enter()
          .append("g"); 

          g_pie_slice.append("path")
            .attr('d', arc)
            .attr('fill', (d,i) => color1(i))
            .style('opacity', 1)
            .style('stroke', 'white');

          g_pie_slice.append("text")
            .attr("class", "name-text")
            .attr('text-anchor', 'middle')
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .attr("fill", "black")
            
          .text(function(d){
            //console.log(d.data.name);
            return d.data.name;
          });
        })

      .on("mouseout", function(d) {   
          div.transition()    
              .duration(500)    
              .style("opacity", 0);

          data1[0].value = 0;
          data1[1].value = 0;
          data1[2].value = 0;
          data1[3].value = 0;
          data1[4].value = 0;
        
          var old_pie = d3.selectAll(".pie").remove(); 
      })

      .on("click", function(d) {
        //maybe brush the state?!
      });
});

function showToolTip(d, dataSet) {
  div.transition()    
      .duration(500)    
      .style("opacity", .9);    
  div .html(((dataSet.find(function(element) {return element.sid == d.id;})).hurricanes.length))
     .style("left", (d3.event.pageX - 100) + "px")
     .style("top", (d3.event.pageY - 20) + "px");
}

// TODO: Producing an error? Unclear why....
function reset() {
  // clears all checkboxes
  $('input[type=checkbox]').each(function() 
  { 
          this.checked = false; 
  }); 

  // resets colors on map back to unfiltered, producing an error
  svg.selectAll("path")
      .attr("class", function(d) {
        var length = (dataByState.find(function(element) {return element.sid == d.id;})).hurricanes.length;
          if (length > 0)
            return quantize(length) + " state"});
}

//
// Filter by month
//
function update(){
  var choices = [];
  d3.selectAll(".myCheckbox").each(function(d){
    cb = d3.select(this);
    if(cb.property("checked")){
      choices.push(cb.property("value"));
    }
  });

  //console.log("choices:", choices)

  if(choices.length > 0){
    newData = filterMonth(dataByState, choices);
    //console.log("NEW DATA:")
    //console.log(newData);
  } else {
    newData = dataByState;     
  } 
  
  // Redraw map!!
  svg.selectAll(".state")
      .attr("class", function(d) {
        var length = (newData.find(function(element) {return element.sid == d.id;})).hurricanes.length;
        if (length > 0)
          return quantize(length) + " state"});

}


function filterMonth(oldData, choices){
  var data = JSON.parse(JSON.stringify(oldData));
  
  for (var i = 0; i < data.length; i++) {
      var newData = data[i].hurricanes.filter(function(d, i){
            ////console.log("to return:")
            ////console.log(choices.includes(d.hurricane.Month));
            return choices.includes(d.hurricane.Month);
      });
      data[i].hurricanes = newData;
  }
  return data;
}

// AUXILIARY FUNCTIONS

function bucketByState(root) {
    var stateData = states_json;

    for (var i in stateData){
        stateData[i].hurricanes = [];
    }

    //for each hurricane
    for (var cane in root) {
        //and each state that it hit
        for (var st in root[cane].Region) {
            var index = stateData.findIndex(function(element) {
                return element.abbrev == root[cane].Region[st].state;
            });
            //add it to the proper state array
            var temp = {};
            temp.category = root[cane].Region[st].category;
            temp.hurricane = root[cane];

            if (temp.category != null){
                stateData[index].hurricanes.push(temp);
            }
        }
    }
    ////console.log(stateData);
    return stateData;
}



//FILTER by Year
function filterByYear(data, low, high){
  //console.log(data);
    // var data = JSON.parse(JSON.stringify(totalData));
    // //console.log(totalData);
    //console.log("low = ", low);
    //console.log("high = ", high);



    for (var state in data){
        ////console.log("i = ", state);
        for (var j in data[state].hurricanes){
            ////console.log("j = ", j);
            var year = data[state].hurricanes[j].hurricane.Year;
            ////console.log(year);
            if ((year < low) || (year > high)){
                ////console.log(year);
                ////console.log("BEFORE", data[state].hurricanes);
                data[state].hurricanes.splice(j, 1);
                ////console.log("AFTER", data[state].hurricanes);
            }
            else {
              ////console.log("in range! year = ", year)
            }
        }
    }
    //console.log(data);
    return data;
}

