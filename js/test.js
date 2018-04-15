// old code from when we were showing only a single hurricane...

//var reds = d3.scaleOrdinal(d3.schemeReds[5]);

var key = 29;

var affected_states = root[key].Region;
//console.log(affected_states);

  var us_states = us.objects.states.geometries;

// svg.append("g")
//       .attr("class", "states")
// 	    .selectAll("path")
// 	    .data(topojson.feature(us, us.objects.states).features)
// 	    .enter().append("path")
// 		.attr("d", path)
		.style("fill", function(d) { return chooseColor(d.id, state_IDs.find(function(element) {return element == d.id;}))});


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
			//console.log(affected_states[i].category);
			if (affected_states[i].sid == id) {
          //console.log(affected_states[i].category);
          //console.log(reds(affected_states[i].category));

					return reds(affected_states[i].category);
			}
		}

}


var state_IDs =[];
getStateIDs();