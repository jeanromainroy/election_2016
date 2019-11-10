(function (L, d3, topojson, searchBar, localization) {
	"use strict";

	/***** Constants *****/
	const parties = [
		{id: 0, name: null, color: "none", abbreviation: null},									// no party
		{id: 1, name: "Democrats", color: "#0015bc", abbreviation: "Dems"},
		{id: 2, name: "Republicans", color: "#e9141d", abbreviation: "GOP"},
		{id: 6, name: "Indépendant", color: "grey", abbreviation: "Ind"}
	];
	const nbrParties = parties.length;

	// Set the center coordinates for usa
	const centerLat = 38.405226;
	const centerLng = -99.221494;
	const initZoom = 4;
	const fitBoundsPadding = [32,32];

	/***** UI Objects *****/
	var map = L.map('map', {
		'worldCopyJump': true
	});

	// Disable double click
	map.doubleClickZoom.disable(); 

	// Seats Table Setters
	function seatsDems(nbrSeats){
		d3.select("#seats").select("#dems-seats").text(nbrSeats);
	}
	function seatsGOP(nbrSeats){
		d3.select("#seats").select("#gop-seats").text(nbrSeats);
	}
	function seatsIND(nbrSeats){
		d3.select("#seats").select("#ind-seats").text(nbrSeats);
	}

	// Update Seats Table
	function updateSeats(){

		// Init variables
		var nbrSeatsDems = 0;
		var nbrSeatsGOP = 0;
		var nbrSeatsIND = 0;

		// Go through path nodes
		d3.selectAll("path").nodes().forEach(function(node){
			
			var partyId = +d3.select(node).attr("party");
			
			if(partyId == 1){
				nbrSeatsDems += 1;
			}else if(partyId == 2){
				nbrSeatsGOP += 1;
			}else if(partyId == 3){
				nbrSeatsIND += 1;
			}			
		});

		// Setters
		seatsDems(nbrSeatsDems);
		seatsGOP(nbrSeatsGOP);
		seatsIND(nbrSeatsIND);
	}

	/***** Loading the data *****/
	var promises = [];
	promises.push(d3.json("data/usa.json"));
	promises.push(d3.csv("data/data.csv"));
	
	Promise.all(promises).then(function (results) {

		/***** Load the data *****/
		var usa = results[0];
		var data = results[1];

		/***** Initialize the map *****/
		initTileLayer(L, map);
		var mapSvg = initSvgLayer(map);
		var g = undefined;
		if (mapSvg) {
			g = mapSvg.select("g");
		}
		

		/***** Tip Info Box *****/
		var tip = d3.tip().attr('class','d3-tip');
		tip.html(function(d) {
            return getToolTipText.call(this, d);
        });
		g.call(tip);


		/***** Create the states *****/
		var path = createPath();
		createStates(g, path, usa, tip);

		/***** Draw and onview reset redraw *****/
		map.on("zoom", function () {
			updateMap(mapSvg, g, path, usa);
		});
		updateMap(mapSvg, g, path, usa);


		/***** Search Bar *****/
		var autoCompleteSources = d3.nest()
		.key(function (d) {
			return d.id;
		})
		.entries(data)
		.map(function (d) {
			return {
				id: +d.values[0].id,
				name: d.values[0].name
			};
		})
		.sort(function (a, b) {
			return d3.ascending(a.name, b.name);
		});

		var searchBarElement = searchBar(autoCompleteSources);
		searchBarElement.search = function (id) {
			var feature = usa.features.find(function (d) {
				return d.properties["NUMCF"] === id;
			});
			var bound = d3.geoBounds(feature);
			search(map, g, id, [
				[bound[0][1], bound[0][0]],
				[bound[1][1], bound[1][0]]
			]);
		};
	});


/**
 * Obtient le texte associé à l'infobulle.
 *
 * @param d               Les données associées à la barre survollée par la souris.
 * @return {string}       Le texte à afficher dans l'infobulle.
 */
function getToolTipText(d) {
	return d.properties['NOMSEN'];
}

/**
 * Projete un point dans le repère de la carte.
 *
 * @param x   Le point X à projeter.
 * @param y   Le point Y à projeter.
 */
function projectPoint(x, y) {
	var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	this.stream.point(point.x, point.y);
}

/**
 * Trace un ensemble de coordonnées dans le repère de la carte.
 *
 * @return {*}  La transformation à utiliser.
 */
function createPath() {
	var transform = d3.geoTransform({point: projectPoint});
	return d3.geoPath().projection(transform);
}



/**
 * Permet d'effectuer un zoom automatique sur la etat recherchée afin de la mettre en évidence.
 *
 * @param map           La carte Leaflet.
 * @param g             Le groupe dans lequel les tracés des etats ont été créés.
 * @param stateId    	Le numéro de l'etat.
 * @param bound         La borne a été utiliser pour réaliser un zoom sur la région.
 *
 * @see http://leafletjs.com/reference-0.7.7.html#map-fitbounds
 */
function search(map, g, stateId, bound) {

	// Focus on the state
	map.fitBounds(bound, {
		'padding': fitBoundsPadding
	});

	// Get the state
	var statePath = g.selectAll("path").filter(function(d){
		return d.properties.NUMCF == stateId;
	})
	
	// Set state to selected
	statePath.classed("hovered",true);
}  

/**
 * Initialize the background map and the initial position
 *
 * @param L     The Leaflet context
 * @param map   The Leaflet map
 *
 */
function initTileLayer(L, map) {

	/*
		Good website to select a map style : https://leaflet-extras.github.io/leaflet-providers/preview/
	*/
	L.tileLayer(
		'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 10.,
			minZoom: 2.,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}
	).addTo(map);

	// Set the initial position
	map.setView([centerLat, centerLng], initZoom);
}


/**
 * Initialize the SVG context that will host the Leaflet map.
 *
 * @param map   The Leaflet map
 * @return      The created SVG element
 *
 */
function initSvgLayer(map) {
	// TODO: Créer l'élément SVG en vous basant sur l'exemple fourni. Assurez-vous de créer un élément "g" dans l'élément SVG.
	var svg = d3.select(map.getPanes().overlayPane).append("svg");
	var g = svg.append("g").attr("class", "leaflet-zoom-hide");

	return svg;
}


/**
 * Crée les tracés des etats sur le contexte SVG qui se trouve au-dessus de la carte Leaflet.
 *
 * @param g             Le groupe dans lequel les tracés des etats doivent être créés.
 * @param path          La fonction qui doit être utilisée pour tracer les entités géométriques selon la bonne projection.
 * @param usa   		Les entités géographiques qui doivent être utilisées pour tracer les etats.
 * @param tip                   L'infobulle à afficher lorsqu'une barre est survolée.
 */
function createStates(g, path, usa, tip) {
  
	var wasDragged = false;
	var mouseDownCoordinates = [0,0];
	var mouseUpCoordinates = [0,0];
	var mouseDistance = 0;

	var mapPathGroups = g.selectAll("g")
		.data(usa.features)
		.enter().append("g");
  
	mapPathGroups.append("path")
		.attr("d", path)
		.attr("party",0)
		.on("mouseover",function(d){

			// Set style
			d3.selectAll("path").classed("hovered",false);
			d3.select(this).classed("hovered",true);
			
			// Very annoying way to set the position of the info box
			var mousePos = d3.mouse(this);
			var posX = mousePos[0] + 20;
			var posY = mousePos[1] - 20;

			// Show info box
			tip.show(d);

			// Set position
			tip.style('left', posX + "px");
			tip.style('top', posY + "px");
		})
		.on("mouseout",function(d){

			// Set style
			d3.select(this).classed("hovered",false);

			// Hide info box
			tip.hide(d);
		})
		.on("mousedown",function(){

			// Get mouse event
			mouseDownCoordinates = d3.mouse(this);

			console.log(d3.select(this));
		})
		.on("mouseup",function(){

			// Get mouse event
			mouseUpCoordinates = d3.mouse(this);

			// Get mouse distance between two click events
			mouseDistance = Math.round(Math.sqrt(Math.pow(mouseUpCoordinates[0] - mouseDownCoordinates[0],2) + Math.pow(mouseUpCoordinates[1] - mouseDownCoordinates[1],2)));

			// Check if it was a click or a drag
			if(mouseDistance > 0){
				wasDragged = true;
			}else{
				wasDragged = false;
			}

			// Clear the mouse variables
			mouseDownCoordinates = [0,0];
			mouseUpCoordinates = [0,0];
			mouseDistance = 0;

			// If was dragged then stop here
			if(wasDragged){
				wasDragged = false;
				return;
			}

			// Get node
			var node = d3.select(this);

			// Get current party
			var currentParty = +node.attr("party");

			// Alternate through parties
			var newParty = (currentParty + 1) % nbrParties;

			// Set party state
			node.attr("party",newParty);

			// Set style
			node.style("fill",parties[newParty].color);

			// Update Table
			updateSeats();
		});
}
 
/**
 * Met à jour la position et la taille de l'élément SVG, la position du groupe "g" et l'affichage des tracés lorsque
 * la position ou le zoom de la carte est modifié.
 *
 * @param svg       		L'élément SVG qui est utilisé pour tracer les éléments au-dessus de la carte Leaflet.
 * @param g         		Le groupe dans lequel les tracés des etats ont été créés.
 * @param path     			La fonction qui doit être utilisée pour tracer les entités géométriques selon la bonne projection.
 * @param usa			Les entités géographiques qui doivent être utilisées pour tracer les etats.
 *
 * @see https://gist.github.com/d3noob/9211665
 */
function updateMap(svg, g, path, usa) {

	var bounds = path.bounds(usa);
	var topLeft = bounds[0];
	var bottomRight = bounds[1];

	svg.attr("width", bottomRight[0] - topLeft[0])
		.attr("height", bottomRight[1] - topLeft[1])
		.style("left", topLeft[0] + "px")
		.style("top", topLeft[1] + "px");

	g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

	// Redraw States
	g.selectAll("path").attr("d", path);
} 

})(L, d3, topojson, searchBar, localization);
