Y_Main.use(
'mqlite-map',
'calendar',
'itinerary-drag-and-drop',
'util',
function(Y){
	"use strict";	
	var addDayButton = Y.one('button#addDay'),
		calendarDiv = Y.one('#calendar'),
		calendar;
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
					Y.one('#itinerary').insertBefore(html, Y.one('#addDateAndCalendar'));
				});
				
				calendar.hide();
		    });
		}		
    });
    
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
