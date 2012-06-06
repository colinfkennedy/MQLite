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
		stopCount = 5;
				
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
		      
		      	Y.Util.renderTemplate('date.html', {date: newDate}, function(html){	
					Y.one('#itinerary').insertBefore(html, Y.one('#controls'));
					//Pop the last instance of the stops div
					var node = Y.all('.stops').pop();
					//Add droppable event to it.
					var target = new Y.DD.Drop({
			            node: node
			        });
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
    	Y.Util.renderTemplate('stop.html', {
    		stopNumber: stopCount,
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
        
	$('.delete-link').tooltip();
	
	/*
	 *	Calculates directions on map.
	 */
	var io,delegate,routeController,
		_drawRoute = function() {	
		MQA.withModule('route','routeio', function() {
			io = new MQA.RouteIO(MQROUTEURL,true);
			delegate = new MQA.Route.RouteDelegate();

			delegate.customizeRibbon = function(ribbonLineOverlay) {
				ribbonLineOverlay.color = "#6C2DC7";
				ribbonLineOverlay.fillColor = "#6C2DC7";
				ribbonLineOverlay.colorAlpha = .8;
				ribbonLineOverlay.borderWidth = 14;
			};
		
			routeController = map.createRoute(delegate, io);
			routeController.draggable = true;
			routeController.poidrag = true;
		
			_route(io);
		});
	},
	
	_route = function(io, newLocations) {
		var firstParam,
			directionsLocations,
			tmpMapState;

		if(!newLocations) {
			tmpMapState = routeController.delegate.virtualMapState(map);
		} else {
			tmpMapState = mapState;
		}
		
		firstParam = {locations: [
			{lat: 53.34804, lng: -6.248328},
			{lat: 53.356711, lng: -6.380336}
		]};

		io.route(
			firstParam,
			{timeout: 10000},
			function(results){
				var status = results.info.statuscode;
				if(status == 0) {
					routeController.setRouteData(results.route);
				}
			});
	};
	
	_drawRoute();
	
}); 
