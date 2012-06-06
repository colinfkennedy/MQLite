Y_Main.use(
'mqlite-map',
'dd-constrain', 
'dd-proxy', 
'dd-drop',
function(Y){
	
	"use strict";	
	
	//Listen for all drop:over events
    Y.DD.DDM.on('drop:over', function(e) {
        //Get a reference to our drag and drop nodes
        var drag = e.drag.get('node'),
            drop = e.drop.get('node');
        
        //Are we dropping on another stop?
        if (drop.hasClass('stop')) {
            //Are we not going up?
            if (!goingUp) {
                drop = drop.get('nextSibling');
            }
            //Add the node to this list
            e.drop.get('node').get('parentNode').insertBefore(drag, drop);
            //Resize this nodes shim, so we can drop on it later.
            e.drop.sizeShim();
        }
    });
    //Listen for all drag:drag events
    Y.DD.DDM.on('drag:drag', function(e) {
        //Get the last y point
        var y = e.target.lastXY[1];
        //is it greater than the lastY var?
        if (y < lastY) {
            //We are going up
            goingUp = true;
        } else {
            //We are going down.
            goingUp = false;
        }
        //Cache for next check
        lastY = y;
    });
    //Listen for all drag:start events
    Y.DD.DDM.on('drag:start', function(e) {
        //Get our drag object
        var drag = e.target;
        //Set some styles here
        drag.get('node').setStyle('opacity', '.25');
        drag.get('dragNode').set('innerHTML', drag.get('node').get('innerHTML'));
        drag.get('dragNode').setStyles({
            opacity: '.5',
            borderColor: drag.get('node').getStyle('borderColor'),
            backgroundColor: drag.get('node').getStyle('backgroundColor')
        });
    });
    //Listen for a drag:end events
    Y.DD.DDM.on('drag:end', function(e) {
        var drag = e.target;
        //Put our styles back
        drag.get('node').setStyles({
            visibility: '',
            opacity: '1'
        });
    });
    //Listen for all drag:drophit events
    Y.DD.DDM.on('drag:drophit', function(e) {
        var drop = e.drop.get('node'),
            drag = e.drag.get('node');

        //if we are not on an li, we must have been dropped on a ul
        if (!drop.hasClass('stop')) {
            if (!drop.contains(drag)) {
                drop.appendChild(drag);
            }
        }
    });
    
    //Static Vars
    var goingUp = false, lastY = 0;

    //Get the list of stops in the lists and make them draggable
    var lis = Y.Node.all('#datesAndStops .date .stops .stop');
    lis.each(function(v, k) {
        var dd = new Y.DD.Drag({
            node: v,
            target: {
                padding: '0 0 0 20'
            }
        }).plug(Y.Plugin.DDProxy, {
            moveOnEnd: false
        }).plug(Y.Plugin.DDConstrained, {
            constrain2node: '#play'
        });
    });

    //Create simple targets for the 2 lists.
    var uls = Y.Node.all('#datesAndStops .date .stops');
    uls.each(function(v, k) {
        var tar = new Y.DD.Drop({
            node: v
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
