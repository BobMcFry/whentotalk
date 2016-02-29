
/* Interval */

var Interval = function(start, end, offset){
	/** Start time of Interval */
	this.start		= start;
	/** End time of Interval */
	this.end 		= end;
	/** Offset to UTC */
	this.offset 	= offset;
}

/**
 * Shifts interval to the origin (i.e. to zero o' clock) and returns that as a 
 * new object.
 * @return Interval prototype with the ofset intervals and the same timezone as 
 * the original one.
 */
Interval.prototype.getIntervalShiftedToOrigin = function() {
	// XXX
};

/**
 * Returns either Start time in UTC or with the actual timezone.
 * @var asUTC Boolean value that switches between returning UTC time or
 * the actual timezone dependant time
 * @return Start time in UTC or in actual timezone
 */
Interval.prototype.getStartTime = function(asUTC) {
	if (asUTC){
		// XXX
	} else {
		// XXX
	}
};

/**
 * Sets the timezone dependant Start time.
 */
Interval.prototype.setStartTime = function(start) {
	// XXX: convert that time to UTC
};



/**
 * Returns either End time in UTC or with the actual timezone.
 * @var asUTC Boolean value that switches between returning UTC time or
 * the actual timezone dependant time
 * @return End time in UTC or in actual timezone
 */
Interval.prototype.getEndTime = function(asUTC) {
	if (asUTC){
		// XXX
	} else {
		// XXX
	}
};

/**
 * Sets the timezone dependant End time.
 */
Interval.prototype.setEndTime = function(end) {
	// XXX: convert that time to UTC
};


/**
 * Returns the duration of the interval in seconds.
 * @return Duration of the interval in seconds
 */
Interval.prototype.getDuration = function() {
	// XXX
};


// Interval.prototype.convertToUTC = function(first_argument) {
// 	// body...
// };




var Person = function(name, cityIdx, timeslider, interval, select){
	this.name 		= name;
	this.cityIdx 	= cityIdx; // if -1 the person is not used
	this.timeslider = timeslider;
	this.interval 	= interval;
	this.select 	= select;
}


Person.prototype.getInterval = function() {
	if (this.cityIdx < 0) {
		this.interval 	= null;
	} else {
		var range 		= this.timeslider.noUiSlider.get();
		this.interval 	= new Interval(parseInt(range[0]), parseInt(range[1]), cities[this.cityIdx].offset);
	}
}







