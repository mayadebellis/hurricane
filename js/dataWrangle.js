var key = 0;

for (x in root) {
  var state_string = root[x].States_Category;
  var state_array = [];
  var split_states = state_string.split("; ");
  for (var i in split_states){
    var single_entry = split_states[i];
    var split_entry = single_entry.split(" ");
    var entry = {};
    entry.state = split_entry[0];
    entry.category = split_entry[1];
    state_array.push(entry);
  }
  root[x].Region = state_array;
  root[x].Key = key;
  key++;
}