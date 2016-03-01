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

/* Interval */

var Interval = function(start, end, offset){
	/** Start time of Interval */
	this.start		= start;
	/** End time of Interval */
	this.end 		= end;
	/** Offset to UTC */
	this.offset 	= offset;
}
// Returns an array because of a possible split at midnight
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



var Person = function(name, cityIdx, timeslider, resultbar, interval){
	this.name 		= name;
	this.cityIdx 	= cityIdx; // if -1 the person is not used
	this.timeslider = timeslider;
	this.resultbar	= resultbar;
	this.interval 	= interval;
}


Person.prototype.readInterval = function() {
	if (this.cityIdx < 0) {
		this.interval 	= null;
	} else {
		var range 		= this.timeslider.noUiSlider.get();
		this.interval 	= new Interval(parseInt(range[0]), parseInt(range[1]), cities[this.cityIdx].offset);
	}
}

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







