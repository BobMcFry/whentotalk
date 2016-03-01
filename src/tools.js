MAX_INT_LEN = 24;
MIN_INT_LEN = 0;
PERSON_CNT 	= 4;
persons 	= new Array();

function initialize() {

	for (var i = 0; i < PERSON_CNT; i++) {
		persons.push(new Person("person" + i, -1, null, $("#result-"+i), null));
	};

 	installSelectize();
	installTimeSlider();
}

// initialize timesliders
function installTimeSlider() {
	
  	$('.timeslider').each(function(idx, elem){
	    noUiSlider.create(elem, {
			start: [ 12, 18 ],
			step: 1,
			behaviour: 'drag-tap',
			margin: 1,
			connect: true,
			tooltips: 
			[ 
				wNumb({
					decimals: 0,
					// postfix: "h"
					edit: timesliderHandleEdit,
					undo: timesliderHandleUndo
				}), 
				wNumb({ 
					decimals: 0,
					// postfix: "h"
					edit: timesliderHandleEdit,
					undo: timesliderHandleUndo
				}) 
			],
			range: {
			  'min':  0,
			  'max':  24
			},
			pips: {
				mode: 'values',
				values: [0, 3, 6, 9, 12, 15, 18, 21, 24],
				density: 4,
				stepped: true
			}
	    });

	    persons[idx].timeslider = elem;

	    elem.noUiSlider.on('update', function(){
			persons[idx].readInterval();
			calculateConversation();
		});
	});
}


function installSelectize() {

	$(".city-select").each(function(idx, elem){
		$(elem)
				.append($("<option></option>")
				.attr("value", -1)
				.text("-"));

		for (var i = 0; i < cities.length; i++) {
			$(elem)
				.append($("<option></option>")
				.attr("value", i)
				.text(cities[i].city + " (" + cities[i].timezone + ")"));
		};

		// Initialize Selectize fields
		persons[idx].select = $(elem).selectize({
			create: false,
			sortField: 'text',
			onChange: function(value){
				persons[idx].cityIdx = value;
				persons[idx].readInterval();
				calculateConversation();
			}
		});
	});
}


function timesliderHandleEdit(value) {
	var newValue = parseInt(value);
	var rest = newValue-Math.floor(newValue);
	return newValue + ":" + ((rest*60)/10) + ((rest*60)%10);
	
}


function timesliderHandleUndo(value) {
	var parts = value.split(":");
	return parseInt(value[0])+parseInt(value[1])/60.0;
}


function calculateConversation(){
	// check wether no of persons allows calculation
	cnt = 0;
	for (var i = 0; i < persons.length; i++) {
		if (persons[i].cityIdx != -1) {
			cnt++;
		}
	};
	if (cnt < 2){
		return;
	}

	var permutations 	= makeCombinations();
	var resultIntervals = new Array();
	for (var i = 0; i < permutations.length; i++) {
		var minMax 	= findMinMax(permutations[i]);
		if (minMax[0] < minMax[1] && minMax[0] != -1 && minMax[1] != -1){
			resultIntervals.push(new Interval(minMax[0], minMax[1], 0));
		}
	};

	resultIntervals = sortIntervalArray(resultIntervals);
	
	for (var i = 0; i < persons.length; i++) {
		if (persons[i].cityIdx != -1) {
			persons[i].displayResult(resultIntervals);
		}
	};
	
}


function sortIntervalArray(intervals){
	var minIdx;
	// sort the array wrt start element
	for (var i = 0; i < intervals.length; i++) {
		minIdx = i;
		for (var j = i+1; j < intervals.length; j++) {
			if (intervals[j].start < intervals[minIdx].start){
				minIdx = j;
			}
		};
		var tmp = intervals[i];
		intervals[i] = intervals[minIdx];
		intervals[minIdx] = tmp;
	};
	return intervals;
}

function makeCombinations() {
	var allIntervals = new Array();
	for (var i = 0; i < persons.length; i++) {
		if (persons[i].cityIdx != -1){
			allIntervals.push(persons[i].interval.getUTCIntervals());	
		}
	};

	return cartProd.apply(this, allIntervals);
}


// find maximum MIN and minimum MAX
function findMinMax(intervals){
	var result = new Array();
	result.push(-1);
	result.push(-1);
	var min = 0-1;
	var max = 24+1;

	for (var i = 0; i < intervals.length; i++) {
		if (intervals[i].start > min) {
			min = intervals[i].start;
			result[0] = min;
		}

		if (intervals[i].end < max) {
			max = intervals[i].end;
			result[1] = max;
		}
	};
	return result;
}




function displayResult(bar, intervals){
	
	clearBar(bar);
	
	var current = 0;
	for (var i = 0; i < intervals.length; i++) {
		// paint red bar between intervals (should always apply)
		if (current < intervals[i].start){
			// paint red bar till start
			paintBar(bar, "progress-bar-danger", intervals[i].start - current, false);
			current = intervals[i].start;
		} 
		
		// paint interval
		paintBar(bar, "progress-bar-success", intervals[i].end - current, false);
		current = intervals[i].end;
	};

	// paint last bar
	if (current < MAX_INT_LEN){
		paintBar(bar, "progress-bar-danger", MAX_INT_LEN - current, false);
	}

}

// Holds all conversion functionalities. So width can be set via absolute values
function paintBar(bar, color, width, text){
	widthString = ((width/MAX_INT_LEN)*100) + "%";
	$(bar).append($("<div></div>")
		.attr("class", "progress-bar " + color)
		.attr("style", "width:"+widthString)
		.text((text ? width+"h": "")));
}


function clearBar(bar){
	$(bar).empty();
}

	

function cartProd(paramArray) {
	function addTo(curr, args) {
		var i, copy, 
		rest = args.slice(1),
		last = !rest.length,
		result = [];
	  	for (i = 0; i < args[0].length; i++) {
			copy = curr.slice();
			copy.push(args[0][i]);
			if (last) {
				result.push(copy);
			} else {
				result = result.concat(addTo(copy, rest));
			}
		}

		return result;
	}

	return addTo([], Array.prototype.slice.call(arguments));
}











