console.log(root);

var dataByState = bucketByState(root);
console.log(dataByState);
//var filteredData = filterByYear(dataByState, 1990, 1992);

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

// MAP

var path = d3.geoPath();

// tooltip
var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
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
          return quantize(length)});

  svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));


  svg.selectAll("path")
      .on("mouseover", function(d) {    
          div.transition()    
              .duration(200)    
              .style("opacity", .9);    
          div .html(((dataByState.find(function(element) {return element.sid == d.id;})).hurricanes.length));
          })          
      .on("mouseout", function(d) {   
          div.transition()    
              .duration(500)    
              .style("opacity", 0); 
      });

});

//
// Filter by month
//
d3.selectAll(".myCheckbox").on("change",update);
update();
      
function update(){
  var choices = [];
  d3.selectAll(".myCheckbox").each(function(d){
    cb = d3.select(this);
    if(cb.property("checked")){
      choices.push(cb.property("value"));
    }
  });

  if(choices.length > 0){
    newData = filterMonth(dataByState, choices);
    console.log("NEW DATA:")
    console.log(newData);
  } else {
    newData = dataByState;     
  } 
  
  newMap = svg.selectAll("path")
      .attr("class", newData);
}

function filterMonth(data, choices){
  for (var state in data) {
    //console.log(state);
      data[state].hurricanes.filter(function(d, i){
            //console.log(d);
            if(choices.includes(d.hurricane.Month)){
              console.log("this was good");
              return true;
            }
            else {
              return false;
            }});
      console.log(data[state].hurricanes);
  }
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
    //console.log(stateData);
    return stateData;
}

function filterByMonth(data){


}


//FILTER by Year
function filterByYear(data, low, high){
  console.log(data);
    // var data = JSON.parse(JSON.stringify(totalData));
    // console.log(totalData);
    console.log("low = ", low);
    console.log("high = ", high);



    for (var state in data){
        //console.log("i = ", state);
        for (var j in data[state].hurricanes){
            console.log("j = ", j);
            var year = data[state].hurricanes[j].hurricane.Year;
            //console.log(year);
            if ((year < low) || (year > high)){
                //console.log(year);
                //console.log("BEFORE", data[state].hurricanes);
                data[state].hurricanes.splice(j, 1);
                //console.log("AFTER", data[state].hurricanes);
            }
            else {
              console.log("in range! year = ", year)
            }
        }
    }
    console.log(data);
    return data;
}

