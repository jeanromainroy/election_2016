# Sentiment Analysis on Tweets related to the 2016 USA Presidential Election

The objective of this project was to create a tool that maps the twitter feed related to the 2016 USA presidential election to the States it's coming from. An interactive electoral map containing a timeline allows the user to navigate the allegiance of tweets.

The tweets were collected through the Twitter API using Social Feed Manager. Three collection are of significance, the tweets from the democratic party and it's candidates, idem for the republicans and general tweets from the american population. The three collections were found on the [George Washington University Librairies Dataverse](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/PDI7IN). Only the unique tweet ids are shared in those collections. It was thus necessary to hydrate the tweets in order to learn their time of creation, the location of the account and the tweet content.

The parties/candidates tweets were used as a labeled dataset to train a unigram logistic regression. The model could then be used to infer the allegiance of tweets from the general population.

# Overview

Let's first look at all the files in the repo

	$ tree --dirsfirst --filelimit 100

	.
	├── analysis
	│   ├── data
	│   │   ├── dataviz
	│   │   │   └── data.json
	│   │   ├── general
	│   │   │   ├── 2016-10-21
	│   │   │   │   ├── predictions.csv
	│   │   │   │   └── tweets.csv
	│   │   │   ├── 2016-10-24
	│   │   │   │   ├── predictions.csv
	│   │   │   │   └── tweets.csv
	│   │   │   ├── 2016-10-28
	│   │   │   │   ├── predictions.csv
	│   │   │   │   └── tweets.csv
	│   │   │   ├── 2016-11-01
	│   │   │   │   ├── predictions.csv
	│   │   │   │   └── tweets.csv
	│   │   │   ├── 2016-11-04
	│   │   │   │   ├── predictions.csv
	│   │   │   │   └── tweets.csv
	│   │   │   ├── 2016-11-07
	│   │   │   │   ├── predictions.csv
	│   │   │   │   └── tweets.csv
	│   │   │   └── 2016-11-09
	│   │   │       ├── predictions.csv
	│   │   │       └── tweets.csv
	│   │   └── parties_candidates
	│   │       ├── democratic
	│   │       │   └── democratic.csv
	│   │       ├── republican
	│   │       │   └── republican.csv
	│   │       └── sources.csv
	│   ├── libs
	│   │   ├── bag_of_worder.py
	│   │   ├── preprocessor.py
	│   │   └── states.py
	│   ├── model
	│   │   ├── dictionary.txt
	│   │   └── logistic.joblib
	│   ├── sources
	│   │   ├── general
	│   │   │   ├── traversed
	│   │   │   │   ├── all_traverse.csv
	│   │   │   │   ├── all_traverse_ordered.csv
	│   │   │   │   ├── election-filter1.txt
	│   │   │   │   ├── election-filter2.txt
	│   │   │   │   ├── election-filter3.txt
	│   │   │   │   ├── election-filter4.txt
	│   │   │   │   ├── election-filter5.txt
	│   │   │   │   └── election-filter6.txt
	│   │   │   ├── election-filter1.txt
	│   │   │   ├── election-filter2.txt
	│   │   │   ├── election-filter3.txt
	│   │   │   ├── election-filter4.txt
	│   │   │   ├── election-filter5.txt
	│   │   │   └── election-filter6.txt
	│   │   └── parties_candidates
	│   │       ├── democratic-candidate-timelines.txt
	│   │       ├── democratic-party-timelines.txt
	│   │       ├── republican-candidate-timelines.txt
	│   │       └── republican-party-timelines.txt
	│   ├── 0-exploration.ipynb
	│   ├── 1-mining.ipynb
	│   ├── 2-preprocessing.ipynb
	│   ├── 3-analysis.ipynb
	│   ├── 4-predict.ipynb
	│   ├── 5-dataviz.ipynb
	│   └── credentials.py
	├── dataviz
	│   ├── assets
	│   │   ├── css
	│   │   │   ├── auto-complete.css
	│   │   │   ├── leaflet.css
	│   │   │   └── style_elections_2016.css
	│   │   ├── img
	│   │   │   └── search.svg
	│   │   └── libs
	│   │       ├── auto-complete.min.js
	│   │       ├── d3.js
	│   │       ├── d3-tip.js
	│   │       ├── leaflet.js
	│   │       ├── localization-en.js
	│   │       ├── search-bar.js
	│   │       └── topojson.v1.js
	│   ├── data
	│   │   ├── data.json
	│   │   └── usa.json
	│   ├── scripts
	│   │   ├── 1-preproc.js
	│   │   ├── 2-map.js
	│   │   └── main.js
	│   └── index.html
	└── README.md



**analysis/** : Contains the notebooks to collect, process, train and predict

**dataviz/** : Contains the interactive map, made using the D3.js library


# Twitter API credentials

To interact with the twitter API, you should update the analysis/credentials.py file with your tokens.


# Launching jupyter notebook

Make sure to cd in analysis/ before launching jupyter notebook. If not, the paths won't work


# Updating the data

If more data is gathered using the *1-mining.ipynb* notebook, it should be added to the analysis/data/general/ directory. The *4-predict.ipynb* notebook can then be used to label the tweets. Finally, the *5-dataviz.ipynb* notebook bundles all the labeled data with their corresponding States and date in one file found in analysis/data/dataviz/data.json. This file should be moved in dataviz/data/ to update the interactive map.


# Potential Future Development

More tweets should be hydrated for each day/state visualized. Right now it is very hard to see any trends with the insufficient amount of data. Something more sophisticated than a unigram logistic regression should also be tried to get better predictions on the tweet's allegiance.


# Authors

* **Jean-Romain Roy** - *First author* - [jeanromainroy](https://github.com/jeanromainroy)
