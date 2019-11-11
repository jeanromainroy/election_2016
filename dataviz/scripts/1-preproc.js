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
 * @param dateparser          	Converts string to date
 */
function createFromSources(data, dateparser){

	data.forEach(function(datum){
		datum.created_at = dateparser(datum.created_at);
	});

	return data;
}

/**
 * Set the time scale for the project
 *
 * @param xScale      X scale to be made proportional to the dates of the project
 * @param data        The data object generated from the two CSV files
 */
function domainX(xScale, data) {

	// Get the earliest date
	var min = new Date();
	data.forEach(function(datum){
		if(datum.created_at < min){
			min = datum.created_at;
		}
	});

	// Get the latest date
	var max = new Date(min);
	data.forEach(function(datum){
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
 * @param datemax           The latest date defined by the sliders
 * 
 */
function timeBoundData(branches,datemin,datemax){

	// Create a deep copy
	var timebound_branches = [];
	
	branches.forEach(function(branch){

		// But change the images
		var newImages = [];
		branch.images.forEach(function(img){
			if(img.created_at > datemin && img.created_at < datemax){
				newImages.push(img);
			};
		});

		// Push new item
		timebound_branches.push({

			// Set item's attributes
			"id": branch.id,
			"name": branch.name,
			"LatLng": branch.LatLng,
			"images": newImages,
			"nbrOfImages": newImages.length,
			"fracOfProject": 0.0,
			"district": branch.district
		});
	});

	// Set the fraction of project attribute for every branch
	var totalNbrImages = 0;
	timebound_branches.forEach(function(d){
		totalNbrImages = totalNbrImages + d.nbrOfImages;
	});
	
	timebound_branches.forEach(function(d){
		if(totalNbrImages > 0){
			d.fracOfProject = d.nbrOfImages/(1.0*totalNbrImages);
		}else{
			d.fracOfProject = 0.0;
		}
	});

	return timebound_branches;
}
