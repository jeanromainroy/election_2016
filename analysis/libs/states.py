import csv

# The American States
states = {
				'AL': 'Alabama',
				'AK': 'Alaska',
				'AZ': 'Arizona',
				'AR': 'Arkansas',
				'CA': 'California',
				'CO': 'Colorado',
				'CT': 'Connecticut',
				'DE': 'Delaware',
				'DC': 'District Of Columbia',
				'FL': 'Florida',
				'GA': 'Georgia',
				'HI': 'Hawaii',
				'ID': 'Idaho',
				'IL': 'Illinois',
				'IN': 'Indiana',
				'IA': 'Iowa',
				'KS': 'Kansas',
				'KY': 'Kentucky',
				'LA': 'Louisiana',
				'ME': 'Maine',
				'MD': 'Maryland',
				'MA': 'Massachusetts',
				'MI': 'Michigan',
				'MN': 'Minnesota',
				'MS': 'Mississippi',
				'MO': 'Missouri',
				'MT': 'Montana',
				'NE': 'Nebraska',
				'NV': 'Nevada',
				'NH': 'New Hampshire',
				'NJ': 'New Jersey',
				'NM': 'New Mexico',
				'NY': 'New York',
				'NC': 'North Carolina',
				'ND': 'North Dakota',
				'OH': 'Ohio',
				'OK': 'Oklahoma',
				'OR': 'Oregon',
				'PA': 'Pennsylvania',
				'RI': 'Rhode Island',
				'SC': 'South Carolina',
				'SD': 'South Dakota',
				'TN': 'Tennessee',
				'TX': 'Texas',
				'UT': 'Utah',
				'VT': 'Vermont',
				'VA': 'Virginia',
				'WA': 'Washington',
				'WV': 'West Virginia',
				'WI': 'Wisconsin',
				'WY': 'Wyoming'
			}


def findState(location):
	"""
		@location is the 'location' feature of a tweet status
	"""

	# Split
	locations = location.split(',')
	 
	# Go through input
	for place in locations:  

		# Find a match with the state list
		for k, v in states.items():
				
			if(place.upper() == k): # The abbreviation
				return k
			if(place.title() == v): # The full name
				return k
	 
	return None



def countStates(tweets_filepath):

	# Open file
	with open(tweets_filepath, 'r', newline='', encoding="utf-8") as csvfile:
			
		# Init reader
		reader = csv.reader(csvfile, quotechar='"', delimiter=',')

		# Taking the header of the file + the index of useful columns:
		header = next(reader)
		ind_label = header.index('label')
		ind_location = header.index('location')
	
		# init state counts variable
		state_counts = {}
		for k, v in states.items():
			state_counts[v] = [0,0]
		
		for row in reader:

			# Grab data
			label = int(row[ind_label])
			location = row[ind_location]

			# check label affiliation
			if(label < 0):
				continue

			# increment state
			state_counts[states[location]][label] += 1
				

		return state_counts
