"use strict";


/**
 * Initialize the background map and the initial position
 *
 * @param L     The Leaflet context
 * @param map   The Leaflet map
 *
 */
function initTileLayer(L, map, centerLat, centerLng, initZoom) {

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
		.attr("data-state",function(d){
			return d.properties.NAME;
		})
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

