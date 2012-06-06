Y_Main.use(
'io-base',
'mqlite-map',
'calendar',
'itinerary-drag-and-drop',
'util',
function(Y){
	"use strict";	
	var _app = Y_Main.namespace('mqlite').$mqliteApp,
		addDayButton = Y.one('button#addDay'),
		calendarDiv = Y.one('#calendar'),
		calendar,
		dateCount = 2,
		stopCount = 5,
		letters = {
			1:'A',
			2:'B',
			3:'C',
			4:'D',
			5:'E',
			6:'F',
			7:'G'
		};
				
    //Event Handler
    addDayButton.on('click', function(){
		
		if(calendar){
			//If we already have a calendar, show it.
			calendar.show();
		}else{
			//Initialise
			calendar = new Y.Calendar({
	          contentBox: "#calendar",
	          width:'200px',
	          showPrevMonth: false,
	          showNextMonth: true,
	          date: new Date()}).render();
	          
	          
	        // Get a reference to Y.DataType.Date
	    	var dtdate = Y.DataType.Date;
	        
	        // Listen to calendar's selectionChange event.
		    calendar.on("selectionChange", function (ev) {
		
		      	// Get the date from the list of selected
		      	// dates returned with the event (since only
		      	// single selection is enabled by default,
		      	// we expect there to be only one date)
		      	var newDate = ev.newSelection[0];
		
		      	// Format the date and output it to a DOM
		     	// element.
		     	newDate = dtdate.format(newDate, {format: "%d %B"});
		       	var nextDay = getNextDay();
		      	Y.Util.renderTemplate('date.html', {date: newDate, className: 'date-'+nextDay}, function(html){	
					Y.one('#itinerary').insertBefore(html, Y.one('#controls'));
					//Pop the last instance of the stops div
					var node = Y.all('.stops').pop();
					//Add droppable event to it.
					var target = new Y.DD.Drop({
			            node: node
			        });
					attachEvents();
				});
				
				calendar.hide();
		    });
		}		
    });
    
    //Add Stop Button
    Y.one('button#addStop').on('click', function(){
    	Y.one('input#addStopInput').show(); 	
    });
    
    //Add key events to the Add Stop Input Box
    $('input#addStopInput').keypress('key', function(event){
		if ( event.which == 13 ) {
	     	_app.navigate( '/itinerary/' + this.value);
    		_app.set('activeInput', this); 
	   	}
    });    
    
    //Adds a Stop
    Y.one('#controls').delegate('click', function(){
        var place_id = this.get('id').replace('place_id_', ''), 
            poi = _app.getSearchByPlaceId(place_id); 
        
        stopCount++;
            
    	//Add it to the list    	
    	var lastDateStopsList = Y.all('.stops').pop();
    	
    	var numberOfStops = $('.date-2 .stop').length;
    		
    	var thisStop = numberOfStops+1;
    	
    	Y.Util.renderTemplate('stop.html', {
    		stopNumber: letters[thisStop],
    		name: poi.display_name,
    		lat: poi.lat,
    		lng: poi.lon
    	}, function(html){
			lastDateStopsList.appendChild(html);
			//Pop the last instance of the date
			var node = Y.all('.stop').pop();
			//Add draggable event to it.
			var dd = new Y.DD.Drag({
            node: node,
            target: {
                padding: '0 0 0 20'
            }
	        }).plug(Y.Plugin.DDProxy, {
	            moveOnEnd: false
	        }).plug(Y.Plugin.DDConstrained, {
	            constrain2node: '#play'
	        });
		});
    	
    	//Hide search box
    	Y.one('input#addStopInput').hide();   
    	
    	//Remove the results
    	Y.one('#itinerary-search-results').get('childNodes').remove(true);
    	
    	//Hide the results box
    	Y.one('#itinerary-search-results-container').hide();   
    	
    }, 'li');


    //Create simple targets for the 2 lists.
    var uls = Y.Node.all('#datesAndStops .date .stops');
    uls.each(function(v, k) {
        var tar = new Y.DD.Drop({
            node: v
        });
    });
    

	// RAFAEL
	String.prototype.startsWith = function(prefix) {
	    return this.indexOf(prefix) === 0;
	}

	String.prototype.endsWith = function(suffix) {
	    return this.match(suffix+"$") == suffix;
	};

	/*
	$('#itinerary').delegate('.delete-link', 'hover', function() {
		$(this).tooltip();
	})
	$('#itinerary').delegate('.btn-seeonmap').click(function() {
		var classes = $(this).attr('class').split(" "),
			classSelected;
		for(var i=0; i<classes.length; i++) {
			if(classes[i].startsWith('date-')) {
				classSelected = classes[i];
			}
		}
		
		drawRoute(getLocations("."+classSelected));		
	});*/
	

	/*
	 * Draw the route on the map.
	 * @param locations {String} of latLng's 
	 *    ex. lat;lng|lat;lng|lat;lng
	 */
	var locations = [],
	
		attachEvents = function() {
			$('.delete-link').tooltip();

			$('.btn-seeonmap').click(function() {
				var classes = $(this).attr('class').split(" "),
					classSelected;
				for(var i=0; i<classes.length; i++) {
					if(classes[i].startsWith('date-')) {
						classSelected = classes[i];
					}
				}

				drawRoute(getLocations("."+classSelected));
			});			
		},
	
		handleResult = function(data) {
		},
	
		drawRoute = function(locations) {
			MQA.withModule('directions', function() {
			    map.addRoute(
					locations,
					{ribbonOptions:{ribbonDisplay:{color:"blue",colorAlpha:.50}}},
					handleResult
				);
		  	});			
			
			/*var locs = locations.split(';'),
				latLng, lat, lng, locsArray = [];
			if(locs && locs.length >= 2) {
				for(var i=0; i<locs.length; i++) {
					latLng = locs[i].split(',');
					lat = latLng[0];
					lng = latLng[1];
					locsArray.push({latLng: {lat: lat,lng: lng}});
				}
				MQA.withModule('directions', function() {
				    map.addRoute(
						locsArray,
						{ribbonOptions:{ribbonDisplay:{color:"#000000",colorAlpha:.33}}}
					);
			  	});			
			} else {
				alert('Inform at least 2 locations');
			}*/
		},
		
		/*getPoints = function(locations) {
			var myurl = "http://www.mapquestapi.com/directions/v1/route?"+ 
				"key=Fmjtd|luua2d0a2h%2Crn%3Do5-hf7n1&" +
				"ambiguities=ignore&" +
				"avoidTimedConditions=false&" +
				"doReverseGeocode=true&" +
				"inFormat=json&" +
				"outFormat=json&" +
				"routeType=fastest&" +
				"timeType=1&" +
				"enhancedNarrative=false&" +
				"shapeFormat=raw&" +
				"generalize=0&" +
				"locale=en_US&" +
				"unit=m";
			$.ajax({
				url: myurl,
				dataType: "jsonp",
				crossDomain:true,
				jsonpCallback: "renderAdvancedNarrative",
				data: {
					location: locations
				},
				success: function(data, textStatus, jqXHR) {
					alert(data.route.locationSequence);
				},
				error: function(xhr, ajaxOptions, thrownError) {
					alert(xhr + ajaxOptions + thrownError);
				}
			});
		},*/
		
		getNextDay = function() {
			return $('#datesAndStops .date').length + 1;
		},
		
		drawOverlay = function(points) {
			MQA.withModule('shapes', function() {

				var line = new MQA.LineOverlay();
				line.setShapePoints([39.633041, -105.318492, 39.847136, -104.674787]);
				map.addShape(line);
			});
		},
		
		getLocations = function(cssDateClass) {
			var latLng, lat, lng, locsArray = [];
			
			$(cssDateClass).each(function() {
				var locationsByDay = [];
				$(this).find('.stop_location').each(function() {
					locationsByDay.push($(this).attr('value'));
				});
				
				if(locationsByDay && locationsByDay.length >= 2) {
					for(var i=0; i<locationsByDay.length; i++) {
						latLng = locationsByDay[i].split(',');
						lat = parseFloat(latLng[0]);
						lng = parseFloat(latLng[1]);
						locsArray.push({latLng: {lat: lat,lng: lng}});
					}
				}
			});
			
			return locsArray;
		};
	
	
	drawRoute(getLocations(".date-1"));
	attachEvents();
}); 
