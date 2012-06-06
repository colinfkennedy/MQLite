Y_Main.use(
'mqlite-map',
'itinerary-drag-and-drop',
'util',
function(Y){
	
	"use strict";	
	
    //Event Handler
    Y.one('button#addDay').on('click', function(){
		Y.Util.renderTemplate('date.html', null, function(html){
			Y.one('#itinerary').insert(html);
		});
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
