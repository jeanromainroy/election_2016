import re

from nltk.stem.snowball import SnowballStemmer
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize
from string import punctuation

from datetime import datetime, timedelta
from email.utils import parsedate_tz

class TwitterPreprocessor():

    #Emoji patterns
    emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE)


    def __init__(self):
        self.stemmer = SnowballStemmer("english", ignore_stopwords=True)
        self.stopwords = set(stopwords.words('english'))
        

    def to_datetime(self, datestring, dateformat="%Y-%m-%d"):
        
        # Remove trailing/leading whitespaces
        datestring = datestring.strip()

        # Parse using the twitter format
        time_tuple = parsedate_tz(datestring)
        dt = datetime(*time_tuple[:6])

        return (dt - timedelta(seconds=time_tuple[-1])).strftime(dateformat)


    def clean(self, tweet):

        # remove URLs
        tweet = re.sub(r'((www\.[^\s]+)|(https?://[^\s]+))','', tweet) 
        tweet = re.sub(r':', '', tweet)
        tweet = re.sub(r'‚Ä¶', '', tweet)
        
        #remove emojis from tweet
        tweet = self.emoji_pattern.sub(r'', tweet)

        # Remove all the special characters
        tweet = re.sub(r'\W', ' ', tweet)

        # remove all single characters
        tweet= re.sub(r'\s+[a-zA-Z]\s+', ' ', tweet)

        # Remove single characters from the start
        tweet = re.sub(r'\^[a-zA-Z]\s+', ' ', tweet) 

        # Substituting multiple spaces with single space
        tweet = re.sub(r'\s+', ' ', tweet, flags=re.I)

        # Removing prefixed 'b'
        tweet = re.sub(r'^b\s+', '', tweet)

        # Make sure there is no punctuation in the characters
        tweet = ''.join([c for c in tweet if c not in punctuation])

        # Converting to Lowercase
        tweet = tweet.lower()

        # Tokenize
        tokens = word_tokenize(tweet)
        
        # Init
        filtered_tweet = []

        # Go through words
        for w in tokens:

            #check tokens against stop words, emoticons, punctuations and numerical
            if(w in self.stopwords):
                continue

            # If clear append
            filtered_tweet.append(w)


        # Join filtered tokens
        tweet = ' '.join(filtered_tweet)

        # Remove leading/trailing whitespaces
        tweet = tweet.strip()

        return tweet
        
        
    def stem(self, tweet):
        
        # Tokenize
        tokens = word_tokenize(tweet)
        
        # Have to return the stemmed token
        tokens = [self.stemmer.stem(token) for token in tokens]
        
        # Join
        tweet = ' '.join(tokens)
        
        return tweet
    
        
    def preprocess(self, tweet):
        
        tweet = self.clean(tweet)
        tweet = self.stem(tweet)
        
        return tweet       
           

    def preprocessAll(self, tweets):
        
        preprocessed_tweets = []

        for tweet in tweets:

            tweet = self.clean(tweet)
            tweet = self.stem(tweet)
            preprocessed_tweets.append(tweet)
        
        return preprocessed_tweets   