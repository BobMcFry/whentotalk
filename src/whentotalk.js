/*
WhenToTalk: A software to plan conversations distributed over the world easily.
Copyright (C) 2016  Christian Heiden

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>. 
*/



/** Constant for maximum length of hours */
MAX_INT_LEN = 24;
/** Constant for minimum length of hours */
MIN_INT_LEN = 0;
/** Amount of persons used (more are supported by algorithm, but style of page
 *	does not allow for more, haha) 
 */
PERSON_CNT 	= 4;
/** Array of persons that participate in the conversation */
persons 	= new Array();



/** 
 *	Interval object.
 */
var Interval = function(start, end, offset){
	/** Start time of Interval */
	this.start		= start;
	/** End time of Interval */
	this.end 		= end;
	/** Offset to UTC */
	this.offset 	= offset;
}

/** 
 *	Returns an array of corresponding UTC intervals because of a possible split
 *	at midnight.
 */
Interval.prototype.getUTCIntervals = function() {
	var returnIntervals = new Array();

	var start 	= this.start - this.offset;
	var end 	= this.end - this.offset;
	start 		= (start+24)%24;
	end 		= (end+24)%24;
	if (end == 0){
		end = 24;
	}
	if (start > end){
		// split
		returnIntervals.push(new Interval(start, 24, this.offset));
		returnIntervals.push(new Interval(0, end, this.offset));
	} else {
		// regular
		returnIntervals.push(new Interval(start, end, this.offset));
	}
	
	return returnIntervals;
};


/**
 *	Person object.
 */
var Person = function(name, cityIdx, timeslider, resultbar, interval){
	this.name 		= name;
	this.cityIdx 	= cityIdx; // if -1 the person is not used
	this.timeslider = timeslider;
	this.resultbar	= resultbar;
	this.interval 	= interval;
}

/**
 *	Reads the interval of its corresponding timeslider.
 */
Person.prototype.readInterval = function() {
	if (this.cityIdx < 0) {
		this.interval 	= null;
	} else {
		var range 		= this.timeslider.noUiSlider.get();
		this.interval 	= new Interval(parseInt(range[0]), parseInt(range[1]), cities[this.cityIdx].offset);
	}
}

/**
 *	Displays the result in the persons resultbar. Does all the conversion into
 *	the persons own timezone. Sort of a WRApPeR, yoo!
 */
Person.prototype.displayResult = function(intervals) {
	var convertedIntervals = new Array();
	var offset = this.interval.offset;
	for (var i = 0; i < intervals.length; i++) {
		var newInterval = new Interval((intervals[i].start + offset + 24)%24, (intervals[i].end + offset + 24)%24, 0);
		if (newInterval.end == 0){
			newInterval.end = 24;
		}
		convertedIntervals.push(newInterval);
	};
	convertedIntervals = sortIntervalArray(convertedIntervals);
	displayResult(this.resultbar, convertedIntervals);
};













/** 
 * 	Initialiazation method that is called upon creation of the website.
 */
function initialize() {

	for (var i = 0; i < PERSON_CNT; i++) {
		persons.push(new Person("person" + i, -1, null, $("#result-"+i), null));
	};

 	installSelectize();
	installTimeSlider();
}

/** 
 * 	Initializes the timeslider for every person.
 */
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

/** 
 * 	Initializes the city chooser for every person.
 */
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
				if (value == -1){
					clearBar(persons[idx].resultbar);
				}
				persons[idx].readInterval();
				calculateConversation();
			}
		});
	});
}

/** 
 * 	A handle that converts the slider value to a tooltip displayable one
 */
function timesliderHandleEdit(value) {
	var newValue = parseInt(value);
	var rest = newValue-Math.floor(newValue);
	return newValue + ":" + ((rest*60)/10) + ((rest*60)%10);
	
}

/** 
 * 	A handle that redos the conversion done in "timesliderHandleEdit"
 */
function timesliderHandleUndo(value) {
	var parts = value.split(":");
	return parseInt(value[0])+parseInt(value[1])/60.0;
}

/** 
 * 	Method which does the whole calculation of the common conversation times
 */
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

	// get the cartesian product of all intervals
	var permutations 	= makeCombinations();

	// for every combination of intervals find the intervals of common 
	// conversation times
	var resultIntervals = new Array();
	for (var i = 0; i < permutations.length; i++) {
		var minMax 	= findMinMax(permutations[i]);
		if (minMax[0] < minMax[1] && minMax[0] != -1 && minMax[1] != -1){
			resultIntervals.push(new Interval(minMax[0], minMax[1], 0));
		}
	};

	// sort the intervals of common conversation times in order to display them
	// correctly
	// XXX: this can maybe put into "displayResult" method, as it is always
	//      needed prior to displaying.
	resultIntervals = sortIntervalArray(resultIntervals);
	
	// display the results on the resultbars
	for (var i = 0; i < persons.length; i++) {
		if (persons[i].cityIdx != -1) {
			persons[i].displayResult(resultIntervals);
		}
	};
	
}

/** 
 * 	Sorts an array of Interval objects according to their start value from
 * 	small to high values.
 */
function sortIntervalArray(intervals){
	
	var minIdx;
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

/** 
 * 	Creates all combinations of all intervals of one person with all intervals
 * 	of other persons, by applying the cartesian product. As these intervals are
 * 	needed for calculating the common conversation times, they are also converted
 * 	to UTC. An array of arrays of Intervals is returned.
 */
function makeCombinations() {
	var allIntervals = new Array();
	for (var i = 0; i < persons.length; i++) {
		if (persons[i].cityIdx != -1){
			allIntervals.push(persons[i].interval.getUTCIntervals());	
		}
	};

	return cartProd.apply(this, allIntervals);
}

/** 
 * Is called by "makeCombinations" in order to calculate the cartesion product
 * of several given intervals.
 */
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

/** 
 * 	Method that finds the maximum MIN and the minimum MAX on a given array of 
 * 	Intervals.
 */
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

/** 
 * 	Displays availability times in a resultbar according to certain given 
 * 	interval.
 */
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

/** 
 * 	Called by "displayResult" in order to add necessary DOM elements to 
 * 	resultbar. Holds all conversion functionalities. So width can be set via 
 * 	absolute values.
 */
function paintBar(bar, color, width, text){
	widthString = ((width/MAX_INT_LEN)*100) + "%";
	$(bar).append($("<div></div>")
		.attr("class", "progress-bar " + color)
		.attr("style", "width:"+widthString)
		.text((text ? width+"h": "")));
}

/** 
 * 	Clears a given resultbar of all DOM elements in it.
 */
function clearBar(bar){
	$(bar).empty();
}
