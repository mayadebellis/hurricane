
console.log(root);
//console.log(states_json);
var dataByState = bucketByState(root);

var colors = ["rgb(192,192,192)", "rgb(255, 255, 0)", "rgb(255, 211, 0)", "rgb(255, 166, 0)", "rgb(255, 113, 0)", "rgb(255, 0, 0)"];

var key = 7; // 288 250 275 158 ---->> !IMPORTANT! ONLY NEED TO CHANGE THIS
var svg = d3.select("svg");

var path = d3.geoPath();

var affected_states = root[key].Region;
console.log(affected_states);

var state_IDs =[];
getStateIDs();

var counter = 0;

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  var us_states = us.objects.states.geometries;
  //var id = get_state_id();
 //console.log(id);

  svg.append("g")
      .attr("class", "states")
	    .selectAll("path")
	    .data(topojson.feature(us, us.objects.states).features)
	    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) { return chooseColor(d.id, state_IDs.find(function(element) {return element == d.id;}))});

  svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

  var us_states = us.objects.states.geometries;

});

function chooseColor(id, affected) {
		if (affected == 'undefined') {
			return colors[0];
		}
		else {
			if (affected == id)
				return checkCategory(id);
		}
	}

function getStateIDs () {
	// Loop through all affected states
	for (var i = 0; i < states_json.length; i++) {

		for (var j = 0; j < affected_states.length; j++)  {
			var dataState = affected_states[j].state;
			var jsonState = states_json[i].abbrev;
			var stateID = states_json[i].sid;

		  if (affected_states[j].state == states_json[i].abbrev) {
		  	state_IDs.push(stateID);
		  	affected_states[j].sid = stateID;
		  }
		}
	}
}

function checkCategory (id) {
	
		for (var i = 0; i < affected_states.length; i++)  {
			console.log(affected_states[i].category);
			if (affected_states[i].sid == id) {
					return colors[affected_states[i].category];
			}
		}

}

function bucketByState(root) {
    console.log("in bucket");
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
            console.log("in fail?");
            console.log(temp);
            console.log("root[cane].Region");

            if (temp.category != null){
                stateData[index].hurricanes.push(temp);
            }
        }
    }
    console.log(stateData);
    return stateData;
}