MAX_INT_LEN = 48;
MIN_INT_LEN = 0;
PERSON_CNT 	= 4;
persons 	= new Array();

function initialize() {

	for (var i = 0; i < PERSON_CNT; i++) {
		persons.push(new Person("person" + i, -1, null, null));
	};

	

 	installSelectize();

 	// XXX: TMP
 	$("#xyz").on("click", calculateConversation);
	
	// initialize timesliders
  	var timeSliders = $('.timeslider');
  	timeSliders.each(function(idx, elem){
	    noUiSlider.create(elem, {
			start: [ 14, 18 ],
			step: 1,
			behaviour: 'drag-tap',
			margin: 1,
			connect: true,
			tooltips: 
			[ 
				wNumb({
					decimals: 0,
					edit: timesliderHandleEdit,
					undo: timesliderHandleUndo
				}), 
				wNumb({ 
					decimals: 0,
					edit: timesliderHandleEdit,
					undo: timesliderHandleUndo
				}) 
			],
			range: {
			  'min':  0,
			  'max':  48
			},
			pips: {
				mode: 'values',
				values: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48],
				density: 2,
				stepped: true
			}
	    });

	    persons[idx].timeslider = elem;

	    elem.noUiSlider.on('update', function(){
			persons[idx].getInterval();			
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
				// XXX: denk dran das offset zu verwenden!
				// .attr("offset", cities[i].offset)
				// .attr("idx", i)
				.text(cities[i].city));
		};

		// Initialize Selectize fields
		persons[idx].select = $(elem).selectize({
			create: false,
			sortField: 'text',
			onChange: function(value){
				persons[idx].cityIdx = value;
			}
		});
	});
}


function timesliderHandleEdit(value) {
	var newValue = parseInt(value);
  	if (newValue < 24){
    	return "Day 1: " + newValue + "h";
  	}
  	else {
    	return "Day 2: " + (newValue % 24) + "h";
  	}
}


function timesliderHandleUndo(value) {
	if (value.startsWith("Day 1")){
    	return value.slice(6, -1);
	} else {
		return (parseInt(value.slice(6, -1))+24);
  	}
}



function calculateConversation(){
	
}

function displayResult(intervals){

	// XXX: sort them or make sure they are sorted
	var current = 0;
	for (var i = 0; i < intervals.length; i++) {
		// paint red bar between intervals (should always apply)
		if (current < intervals[i].start){
			// paint red bar till start
			paintBar("progress-bar-danger", intervals[i].start - current, false);
			current = intervals[i].start;
		} 
		
		// paint interval
		paintBar("progress-bar-success", intervals[i].end - current, true);
		current = intervals[i].end;
	};

	// paint last bar
	if (current < MAX_INT_LEN){
		paintBar("progress-bar-danger", MAX_INT_LEN - current, false);
	}

}

// Holds all conversion functionalities. So width can be set via absolute values
function paintBar(color, width, text){
	widthString = ((width/MAX_INT_LEN)*100) + "%";
	$("#result").append($("<div></div>")
		.attr("class", "progress-bar " + color)
		.attr("style", "width:"+widthString)
		.text((text ? width+"h": "")));
}


function testDisplayResult() {
	var intervals = new Array();
	intervals.push(new Interval(1, 2, 0));
	intervals.push(new Interval(5, 8, 0));
	intervals.push(new Interval(12, 19, 0));
	intervals.push(new Interval(20, 21, 0));
	intervals.push(new Interval(30, 38, 0));
	displayResult(intervals);
}
	





