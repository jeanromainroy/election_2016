"use strict";

/**
 * Order Elements in chronological descending order
 *
 * @param a       First element
 * @param b       Second element
 * 
 */
function sortByDateDescending(a, b) {
	return b.created_at - a.created_at;
}



/**
 * We create a [id,name] list of all branches and districts
 *
 * @param data               	Raw Data
 * @param usa               	The geo features
 * @param dateparser          	Converts string to date
 */
function createFromSources(data, usa, dateparser){

	data.forEach(function(datum){
		datum.created_at = dateparser(datum.created_at);
	});

	return data;
}

/**
 * Set the time scale for the project
 *
 * @param xScale      X scale to be made proportional to the dates of the project
 * @param dataframe   The data object generated from the two CSV files
 */
function domainX(xScale, dataframe) {

	// Get the earliest date
	var min = new Date();
	dataframe.forEach(function(datum){
		if(datum.created_at < min){
			min = datum.created_at;
		}
	});

	// Get the latest date
	var max = new Date(min);
	dataframe.forEach(function(datum){
		if(datum.created_at > max){
			max = datum.created_at;
		}
	});
	
	var padding = 2;
	var min_date = new Date(min);
	var max_date = new Date(max);

	min_date.setDate(min.getDate()-padding);
	max_date.setDate(max.getDate()+padding);
	
	// Set the scale
	xScale.domain([min_date,max_date]);
}

/**
 * Restrict the data to the time constraints
 *
 * @param branches           The data object generated from the two CSV files
 * @param datemin           The earliest date defined by the sliders
 * 
 */
function timeBoundData(dataframe,slider_date){

	// Create a deep copy
	var timebound_data = [];
	var min_diff = new Date();
	
	dataframe.forEach(function(datum){

		var diff_time = Math.abs(datum.created_at.getTime() - slider_date.getTime());

		if(diff_time < min_diff){
			min_diff = diff_time;
			timebound_data = datum;
		}
	});

	return timebound_data;
}
