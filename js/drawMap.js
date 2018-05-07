/*******************************************************************
   Important vars
*******************************************************************/
var dataByState = bucketByState(root);
var currDataSet = dataByState;
var selectedStates = [];
var startYear = 1851;
var endYear = 2016;

// pie chart
var width = 281;
var text = "";
var height = 200;
var data1 = [
  {name: "Category 1", value: 0},
  {name: "Category 2", value: 0},
  {name: "Category 3", value: 0},
  {name: "Category 4", value: 0},
  {name: "Category 5", value: 0},
];

var color = d3.scaleOrdinal(d3.schemeCategory20);
// last color is category 5
// var color1 = ["#FF2323","#FF8D1C", "#FFC140", "#FFFF32", "#BCFF59"];
// var color1 = ["#BCFF59","#FFFF32","#FFC140","#FF8D1C", "#FF2323" ];

var color1 = ["#FF4E00", "#E80000", "#B80C09", "#7D0037", "#4C061D"];
var radius = 50;


setupSlider(1851, 2016, updateSlide);
function updateSlide(v1, v2) {
  startYear = v1;
  endYear = v2;
}



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
  .title("Number of Hurricanes to Make Landfall")
  .titleWidth(100)
  .scale(quantize);

svg.select(".legendQuant")
  .call(legend);

// MAP
var path = d3.geoPath();

$(".map").not("path").on("click", function (e) {
  if (e.target.nodeName != "path") {
    d3.selectAll(".state")
      .style("opacity", 1);
    d3.selectAll(".pie").remove();
    selectedStates = [];
  }
});

var div = d3.select("body").append("div") 
    .attr("id", "tooltip")       
    .style("opacity", 0)
    .style("left", function(d) {return $(".legendQuant").offset().left + "px";})
    .style("top", $(".legendQuant").offset().top + 275 + "px");

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

        d3.selectAll(".state")
          .filter(function(elem) {return !(selectedStates.includes(elem.id));})
          .style("opacity", 0.25);

        d3.selectAll(".state")
          .filter(function(elem) {return elem.id == d.id;})
          .style("opacity", 1);
      

          // console.log("d is in here", d);
          // console.log("currDataSet is in here", currDataSet);

      if (!selectedStates.includes(d.id) && selectedStates.length < 2){ 
            drawPie(d.id);
          } 
        

  })
      .on("mouseout", function(d) {  
        // brushing
        d3.selectAll(".state")
            .filter(function(elem) {return !selectedStates.includes(elem.id);})
            .style("opacity", 0.25);

        if (selectedStates.length == 0) {
          d3.selectAll(".state")
            .style("opacity", 1);
        } 

        // for state tool tip
          div.transition()    
              .duration(400)    
              .style("opacity", 0);

        // for pie chart
          data1[0].value = 0;
          data1[1].value = 0;
          data1[2].value = 0;
          data1[3].value = 0;
          data1[4].value = 0;

          //Clears old pie chart when not hovering
          if (!selectedStates.includes(d.id)){ 
            var id = "#pie" + d.id;
            d3.selectAll(id).remove();
            
          } 
      })

      .on("click", function(d) {
        // brushing
        if (!selectedStates.includes(d.id) && selectedStates.length < 2) {
          selectedStates.push(d.id);
        } else {
          var i = selectedStates.indexOf(d.id);
          if (i > -1) {
            selectedStates.splice(i, 1);
          }
          var id = "#pie" + d.id;
          d3.selectAll(id).remove();
        }

        d3.selectAll(".state")
          .style("opacity", 0.25);

        d3.selectAll(".state")
          .filter(function(elem) {return selectedStates.includes(elem.id);})
          .style("opacity", 1);     
        });

});



function showToolTip(d, dataSet) {
  div.transition()    
      .duration(250)    
      .style("opacity", .9);    
  div .html(function () {
      var len = ((dataSet.find(function(element) {return element.sid == d.id;})).hurricanes.length) 
      if (len == 1)
        return len + " hurricane";
      else 
        return len + " hurricanes";
    })};

/*******************************************************************
    Reverts all changes to data and viz from filtering to defaults
*******************************************************************/
function reset() {
  // Reset slider
  sliderVals = [1851, 2016];
  resethandle = d3.selectAll(".handle")
    .attr("y", -8)
    .attr("x", function(d) { return x(sliderVals[d]); })
    .attr("rx", 3)
    .attr("height", 16)
    .attr("width", 20);
  selRange
      .attr("x1", 10+x(1851))
      .attr("x2", 10+x(2016));

  // clears all checkboxes
  $('input[type=checkbox]').each(function() 
  { 
          this.checked = false; 
  }); 

  // Resets data
  currDataSet = dataByState;

  // Resets legend
  var legend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .useClass(true)
    .title("Number of Hurricanes to Make Landfall")
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

  for (var i = 0; i < selectedStates.length; i++){
        var id = "#pie" + selectedStates[i];
        d3.selectAll(id).remove();
        data1[0].value = 0;
          data1[1].value = 0;
          data1[2].value = 0;
          data1[3].value = 0;
          data1[4].value = 0;
        drawPie(selectedStates[i]);
      }

}

/*******************************************************************
    Updates all changes to data and viz from filtering
*******************************************************************/
function update(){
  //
  // Filter months
  //
  var choices = [];
  d3.selectAll(".myCheckbox").each(function(d){
    cb = d3.select(this);
    if(cb.property("checked")){
      choices.push(cb.property("value"));
    }
  });

  if(choices.length > 0){
    newData = filterMonth(dataByState, choices);
  } else {
    newData = dataByState;     
  } 

  //
  // Filter years
  //
  newData = filterYear(newData, startYear, endYear);

  // Change the current dataset being used in tooltips etc
  currDataSet = newData;

  //
  // Update legend
  //
  var tempDomain = [];
  for (var st in newData) { tempDomain.push(newData[st].hurricanes.length); }
  var maxD = Math.max.apply(Math, tempDomain);

  var filteredQuantize = quantize.copy();
  filteredQuantize.domain([0, maxD]);

  if (maxD < 8 && maxD > 0) {
    filteredQuantize.range(d3.range(maxD).map(function(i) { return "q" + i + "-8"; }));
  }

  var filteredLegend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .useClass(true)
    .title("Number of Hurricanes to Make Landfall")
    .titleWidth(100)
    .scale(filteredQuantize);

  // Update values for colors
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


      console.log("selectedStates are", selectedStates);

      for (var i = 0; i < selectedStates.length; i++){
        var id = "#pie" + selectedStates[i];
        d3.selectAll(id).remove();
        drawPie(selectedStates[i]);
      }

}

// AUXILIARY and FILTERING FUNCTIONS

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
    return stateData;
}


function filterMonth(oldData, choices){
  var data = JSON.parse(JSON.stringify(oldData));
  
  for (var i = 0; i < data.length; i++) {
      var newData = data[i].hurricanes.filter(function(d, i){
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
                      return ((d.hurricane.Year >= low) && (d.hurricane.Year <= high));
      });
      data[i].hurricanes = newData;
  }
  return data;

}

function drawPie (d){

  $(".chart").show();

  var state_obj = (currDataSet.find(function(element) {return element.sid == d;})).hurricanes;
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

  // appends svg to chart area 
  var pie_svg = d3.select(".chart").append("svg")
      .attr("class", "pie")
      .attr("id", ("pie" + d))
      .style("width", width)
      .style("height", height);
      
  
  var state_name = (states_json.find(function(elem) { if (d == elem.sid) return elem.name;})).name;

  // TODO: Add title to Pie Chart    
  pie_svg.append("text")
      .attr("x", width / 2 )
      .attr("y", 40)
      .style("text-anchor", "middle")
      .text(state_name);


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
      .attr("class", "pie-slice")
      .attr('fill', (d,i) => color1[i])
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
      
// Chart labels 
  g_pie_slice.append("text")
      .attr("class", "name-text")
      .attr("transform", function(d,i){
      var pos = arc.centroid(d);
      pos[0] = radius * (midAngle(d) < Math.PI ? 1.2 : -1.2);
        
    
  var percent = (d.endAngle - d.startAngle)/(2*Math.PI)*100
       if(percent<3){
        pos[1] += i*17;
       }
        return "translate("+ pos +")";
      })
      .text(function(d) { 
        if (d.value > 0) {
          return d.data.name;
        }
         })
      .attr("fill", "#333")
      .attr("text-anchor", 'left')
      .attr("dx", function(d){
      var ac = midAngle(d) < Math.PI ? 3:-53
              return ac
      })
      .attr("dy", 0)
      
      
    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

   

    var polyline = g_pie.selectAll("polyline")
      .data(pie(data1), function(d) {
        return d.data.currency;
      })
      .enter()
      .append("polyline")
      .attr("class", "title-polyline")
      .attr("id", function(d) {
         return d.data.name;
      })
      .attr("dy", 5)
      .attr("points", function(d,i) {
        var pos = arc.centroid(d);
          pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        var o=   arc.centroid(d)
        var percent = (d.endAngle -d.startAngle)/(2*Math.PI)*100
         if(percent<3){
         o[1] 
         pos[1] += i*15
         }
         //return [label.centroid(d),[o[0],0[1]] , pos];
          return [label.centroid(d),[o[0],pos[1]] , pos];
        })
        .style("fill", "none")
        //.attr('stroke','grey')
        .attr("stroke", function(d,i) { return color1[i]; })
        .style("stroke-width", function(d,i){
          if (d.value > 0){
            return "1px";
          } else {
            return "0px";
          }
        });
    relax(d);
          d3.selectAll(".pie-slice")
            .on("mouseover", function(d) {
              // console.log("this is: ", (((this.parentNode).parentNode).parentNode).id);
                var pie_id = (((((this.parentNode).parentNode).parentNode).id));
                
                var pie_tooltip_div = d3.select("#" + pie_id).append("text")
                    .attr("class", ("pie-tooltip" + ((pie_id).substring(3,5))))
                    .attr("y", "180")
                    .attr("x", "45")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    
                    .style("opacity", 0);
                pie_tooltip_div
                  .html(d.data.name + ": " + d.value + " hurricanes");
                pie_tooltip_div
                  .transition()    
                  .duration(400)    
                  .style("opacity", 1)
                  
              
            })
            .on("mouseout", function(d){
               var pie_id = (".pie-tooltip" + ((((((this.parentNode).parentNode).parentNode).id)).substring(3,5)));
                // console.log("this is foreal:"+ ((((this.parentNode).parentNode).parentNode).id).substring(3,5));
                // console.log("pie id pie id" + pie_id);
                var pie_tooltip_div = d3.selectAll(pie_id)
                  .transition()    
                  .duration(300)    
                  .style("opacity", 0);
                  
              // console.log("d is at the end of mouseout" , d);

            });





}

function relax(d) {
    again = false;
    var id = "#pie" + d;
    var delta_lines = [];

    var titles = d3.select(id).selectAll(".name-text");
    var polylines = d3.select(id).selectAll("polyline");
     
    // console.log("polylines are", polylines);

        titles.each(function (d, i) {
        a_obj = this;
        a = this;
        da = d3.select(a);
        y1 = da.attr("y");


        a = $(a).attr("transform");
        a = a.split("(");
        a = a[1].split(")");
        a = a[0].split(",");
        
        titles.each(function (d, j) {
            b = this;
            b_obj = this;
            da = d3.select(a_obj);
            db = d3.select(b_obj);

            // console.log("&&&&&da, db are: ", da, db);


            
            // a & b are the same element and don't collide.
            if (a_obj == b_obj) return;

            b = $(b).attr("transform");
            b = b.split("(");
            b = b[1].split(")");
            b = b[0].split(",");
            
            var dx_a = a[0];
            var dy_a = a[1];
            var dx_b = b[0];
            var dy_b = b[1];

            

            if ((dx_a > 0 && dx_b < 0) || (dx_a < 0 && dx_b > 0)){
              return;
            }

            deltaY = Math.abs(dy_a - dy_b);
            // console.log("deltaY btw", a_obj, "and ", b_obj, "is " + deltaY);

            if (deltaY < 8) {

              if (dy_a > dy_b){ //dy_a is lower than dy_b 
                da = d3.select(a_obj);
                db = d3.select(b_obj);
                // console.log("A is: "+ JSON.stringify(a_obj.lastChild));

                b = $(b_obj).html();
                // console.log("B is: ", b);

                delta_lines.push($(a_obj).html());
                delta_lines.push($(b_obj).html());

                // console.log("delta_lines are: ", delta_lines);
                
                da.attr("dy", -7);
                db.attr("dy", 4);

                
              }  

            }
          });
        });
        
        polylines.each(function (d, i) {
        a_obj = this;
        a = this;
        da = d3.select(a);
        y1 = da.attr("y");
      
        // console.log("d in polylines relax is:", a);
        
        polylines.each(function (d, j) {
            b = this;
            b_obj = this;
          // console.log("a & b in polylines relax are : ", a, b);

            // a & b are the same element and don't collide.
            if (a_obj === b_obj){ return;}
            
            var dx_b = b[0];
            var dy_b = b[1];

            var dx_a = a[0];
            var dy_a = a[1];

            // console.log("!!!!d lines is :", delta_lines);
            // console.log("!!!! a.id, b.id: "+ a.id + " " + b.id);
            if (a.id == delta_lines[0] && b.id == delta_lines[1]){
                
                // console.log("HIT a.id, b.id: "+ a.id + " " + b.id);
                
                da = d3.select(a_obj);
                db = d3.select(b_obj);

                // console.log("da, db are: ", da, db);

                da.attr("transform","translate(0,-8)");
                db.attr("transform","translate(0,6)");

                return;
              }  

            
          });
        });
}

$(".help").mouseover(function(){
  $(".help-text").css("visibility", "visible");

  var left_offset = $(".sidebar").offset().left + "px";
  var top_offset = $( "#filters" ).offset().top + ($( "#filters" ).outerHeight() - $( ".help-text" ).outerHeight()) + "px";

  $(".help-text").css("left", left_offset);
  $(".help-text").css("top", top_offset);v
  
});

$(".help").mouseout(function(){
  $(".help-text").css("visibility", "hidden");

});


