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
	$(".active-partner").each(function(idx, elem){
		$(elem).children(".timeslider").each(function(idx2, elem2){
			var range 				= $(elem2).noUiSlider.get();
			var interval 			= new Interval(range[0], range[1], cities[persons[idx].cityIdx].offset);
			persons[idx].interval 	= interval;
		});
	});
}










