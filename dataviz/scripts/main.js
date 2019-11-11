(function (L, d3, topojson, searchBar, localization) {
	"use strict";

	/***** Constants *****/

	// created_at parser
	var dateparser = d3.timeParse("%Y-%m-%d");

	// Set the center coordinates for usa
	const centerLat = 38.405226;
	const centerLng = -99.221494;
	const initZoom = 4;
	const fitBoundsPadding = [32,32];

	/***** UI Objects *****/
	var map = L.map('map', {
		'worldCopyJump': true
	});


	// Time Sliders
	var track = d3.select("#track");
	var slider_1 = d3.select("#slider_1");
	const sliderWidth = remove_px(slider_1.style("width"));
	const trackWidth = remove_px(track.style("width"));
	const trackLeftOffset = remove_px(track.style("left"));

	/***** Set the Timeline's attributes *****/
	const timelineWidth = remove_px(track.style("width"));
	const timelineHeight = remove_px(track.style("height"));
	const timelineOffset = remove_px(track.style("left"));


	// Init the color scale
	var color = d3.scaleSqrt();
	color.domain([0.0, 1.0]).range(['#0015bc', '#e9141d']).interpolate(d3.interpolate);


	// Scales
	var timelineScale = d3.scaleTime().range([0, timelineWidth]);
	var timelineAxis = d3.axisBottom(timelineScale).tickFormat(localization.getFormattedDate);


	/***** We initiate the timeline html object *****/
	var trackSvg = track.select("svg")    // we grab the SVG object inside of the track html object
		.attr("width", timelineWidth)       // set the width and height
		.attr("height", timelineHeight);



	// Disable double click
	map.doubleClickZoom.disable(); 


	/***** Loading the data *****/
	var promises = [];
	promises.push(d3.json("data/usa.json"));
	promises.push(d3.json("data/data.json"));
	
	Promise.all(promises).then(function (results) {

		/***** Load the data *****/
		var usa = results[0];
		var tweets = results[1];

		// Get States from Geo
		var states = [];
		usa.features.forEach(function(state){
			states.push({
				"id":+state.properties["STATE"],
				"name":state.properties["NAME"]
			});
		})
		
		// Create the dataframe
		const dataframe = createFromSources(tweets,usa,dateparser);
		
		// Set the time scale using the data
		domainX(timelineScale,dataframe);


		/***** Initialize the map *****/
		initTileLayer(L, map, centerLat, centerLng, initZoom);
		var mapSvg = initSvgLayer(map);
		var g = undefined;
		if (mapSvg) {
			g = mapSvg.select("g");
		}
		

		/***** Tip Info Box *****/
		var tip = d3.tip().attr('class','d3-tip');
		tip.html(function(d) {
            return getToolTipText.call(this, d, data, localization);
        });
		g.call(tip);


		/***** Create the states *****/
		var path = createPath();
		createStates(g, path, usa, tip);

		
		// Get active data
		var data = [];

		function updateView(){

			// Get slider date
			var slider_date = timelineScale.invert(slider_getXPos(slider_1));

			// Update Data
			data = timeBoundData(dataframe,slider_date);
			
			// Update Colors
			updateColors(data, color, localization);
		}
		updateView();


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
		.entries(states)
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
				return +d.properties["STATE"] === id;
			});
			var bound = d3.geoBounds(feature);
			search(map, [
				[bound[0][1], bound[0][0]],
				[bound[1][1], bound[1][0]]
			]);
		};


		/***** Set the timeline axis *****/
		trackSvg.append("g")
			.attr("class", "axis")
			.call(timelineAxis
					.ticks(d3.timeDay, 3)
					.tickFormat(d3.timeFormat('%d'))); 

		/***** Add Mouse event to Time Slider *****/
		var drag = d3.drag()
			.on("start", function(d){
				slider_select(d3.select(this));
			})
			.on("drag", function(d){
				var x_pos = d3.event.x;
				slider_setXPos(d3.select(this),x_pos);
				updateView();
			})
			.on("end", function(d){
				slider_deselect(d3.select(this));
				updateView();
			});

		// Set drag event handle on sliders
		slider_1.call(drag)

	});


/**
 * Obtient le texte associé à l'infobulle.
 *
 * @param d               Les données associées à la barre survollée par la souris.
 * @return {string}       Le texte à afficher dans l'infobulle.
 */
function getToolTipText(d, data, localization) {

	var stateName = localization.capitalize(d.properties['NAME']);
	
	var datum = data['states'][stateName];

	var proGOP = Math.round(100.0*datum[1]/(datum[0] + datum[1]));
	var proDems = 100 - proGOP;

	var info = "<h2>" + d.properties['NAME'] + "</h2><p>Dems: " + proDems + "%</p><p>Rep: " + proGOP + "%</p>";

	return info;
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
function search(map, bound) {

	// Focus on the state
	map.fitBounds(bound, {
		'padding': fitBoundsPadding
	});
}  


/**
* Convert position string to integer, ex. 42px -> 42
* 
* @param attr_str  The string of a value followed by px
*/
function remove_px(attr_str){
	return +attr_str.substring(0,attr_str.length-2);
}


/***** Sliders Functions *****/
// Getter
function slider_getXPos(slider){

	var sliderOffset = remove_px(slider.style("left"));

	return sliderOffset - timelineOffset + sliderWidth/2.0;
}

// Setter
function slider_setXPos(slider,x_pos){
	
	// Get new position for slider
	var newpos = x_pos - sliderWidth/2;

	// Make sure this position is inside of the track
	if(newpos < trackLeftOffset){ 										// too left
		return;
	}else if(newpos + sliderWidth > trackLeftOffset + trackWidth){		// too right
		return;
	}

	// Set position
	slider.style("left",newpos + "px");

	// Set the date under the slider
	var actualXPos = slider_getXPos(slider);
	var parsedDate = timelineScale.invert(actualXPos);
	var formattedDate = localization.getShortMonthDay(parsedDate);
	slider.select("p").text(formattedDate);
}

// Appearance
function slider_select(slider){
	slider.style("opacity","0.5");
}

function slider_deselect(slider){
	slider.style("opacity","1.0");
}


})(L, d3, topojson, searchBar, localization);
