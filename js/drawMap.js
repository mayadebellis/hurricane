console.log(root);

var dataByState = bucketByState(root);
var currDataSet = dataByState;

var startYear = 1851;
var endYear = 2016;

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

// pie chart
var width = 230;
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
var radius = 50;

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
        var length = (currDataSet.find(function(element) {return element.sid == d.id;})).hurricanes.length;
        if (length > 0)
          return quantize(length) + " state"
        else
          return "state"});

  svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

  svg.selectAll("path")
      .on("mouseover", function(d) {
        showToolTip(d, currDataSet);
  
        var state_obj = (currDataSet.find(function(element) {return element.sid == d.id;})).hurricanes;
        
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
        // appends svg to chart area 
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

        var label = d3.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        var pie = d3.pie()
          .value(function(d) {return d.value; })
          .sort(null);

        
        
        var g_pie_slice = g_pie.selectAll('g')
          .data(pie(data1))
          .enter()
          .append("g"); 

          g_pie_slice.append("path")
            .attr('d', arc)
            .attr('fill', (d,i) => color1(i))
            .style('opacity', 1)
            .style('stroke', 'white');

          // g_pie_slice.append("text")
          //   .attr("class", "name-text")
          //   .attr('text-anchor', 'middle')
          //   .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          //   .attr("dy", ".35em")
          //   .attr("fill", "black")
            
          // .text(function(d){
          //   //console.log(d.data.name);
          //   return d.data.name;
          // });
        


// Chart labels - still under construction 
  g_pie_slice.append("text")
      .attr("class", "name-text")
      .attr("transform", function(d,i){
      var pos = arc.centroid(d);
      pos[0] = radius * (midAngle(d) < Math.PI ? 1.1 : -1.1);
        
    
  var percent = (d.endAngle - d.startAngle)/(2*Math.PI)*100
       if(percent<3){
       //console.log(percent)
       pos[1] += i*15
       }
        return "translate("+ pos +")";
      })
      .text(function(d) { return d.data.name; })
      .attr("fill", function(d,i) { return color1(i); })
      .attr("text-anchor", 'left')
      .attr("dx", function(d){
      var ac = midAngle(d) < Math.PI ? 0:-50
              return ac
      })
      .attr("dy", 5 )
      
      
     function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    var polyline = g_pie.selectAll("polyline")
      .data(pie(data1), function(d) {
        return d.data.currency;
      })
      .enter()
      .append("polyline")
      .attr("points", function(d,i) {
        var pos = arc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
         var o=   arc.centroid(d)
 var percent = (d.endAngle -d.startAngle)/(2*Math.PI)*100
       if(percent<3){
       //console.log(percent)
       o[1] 
       pos[1] += i*15
       }
       //return [label.centroid(d),[o[0],0[1]] , pos];
        return [label.centroid(d),[o[0],pos[1]] , pos];
      })
      .style("fill", "none")
      //.attr('stroke','grey')
      .attr("stroke", function(d,i) { return color1(i); })
      .style("stroke-width", "1px");

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
          
          //Clears old pie chart when not hovering
          var old_pie = d3.selectAll(".pie").remove(); 
      })

      .on("click", function(d) {
        //TODO @Ballard - when you click two states both pie charts will show up 
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


function reset() {
  // clears all checkboxes
  $('input[type=checkbox]').each(function() 
  { 
          this.checked = false; 
  }); 

  currDataSet = dataByState;

  var legend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .useClass(true)
    .title("Aggregate Total of Hurricanes")
    .titleWidth(100)
    .scale(quantize);

  svg.select(".legendQuant")
    .call(legend);


  // resets colors on map back to unfiltered
  svg.selectAll(".state")
      .attr("class", function(d) {
        var length = (dataByState.find(function(element) {return element.sid == d.id;})).hurricanes.length;
          if (length > 0)
            return quantize(length) + " state"
          else
            return "state"});
}

//
// Filter by month
//
function update(){
  //Filter months
  var choices = [];
  d3.selectAll(".myCheckbox").each(function(d){
    cb = d3.select(this);
    if(cb.property("checked")){
      choices.push(cb.property("value"));
    }
  });

  if(choices.length > 0){
    newData = filterMonth(dataByState, choices);
    //console.log("NEW DATA:")
    //console.log(newData);
  } else {
    newData = dataByState;     
  } 

  //Filter years
  newData = filterYear(newData, startYear, endYear);
  currDataSet = newData;


  console.log(newData)
  // TODO:: dont hard code domain
  var tempDomain = [];
  for (var st in newData) {
    tempDomain.push(newData[st].hurricanes.length);
  }
  var maxD = Math.max.apply(Math, tempDomain);


  var filteredQuantize = quantize.copy();
  console.log(filteredQuantize);
    filteredQuantize.domain([0, maxD]);

  var filteredLegend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .useClass(true)
    .title("Aggregate Total of Hurricanes")
    .titleWidth(100)
    .scale(filteredQuantize);

  svg.select(".legendQuant")
    .call(filteredLegend);

  // Redraw map!!
  svg.selectAll(".state")
      .attr("class", function(d) {
        var length = (newData.find(function(element) {return element.sid == d.id;})).hurricanes.length;
        if (length > 0)
          return filteredQuantize(length) + " state"
              else
          return "state"});


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


function filterYear(oldData, low, high){
  var data = JSON.parse(JSON.stringify(oldData));
  
  for (var i = 0; i < data.length; i++) {
      var newData = data[i].hurricanes.filter(function(d, i){
            ////console.log("to return:")
            ////console.log(choices.includes(d.hurricane.Month));
            return ((d.hurricane.Year > low) && (d.hurricane.Year < high));
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


