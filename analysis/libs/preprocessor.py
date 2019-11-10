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

    # Sad Emoticons
    emoticons_sad = set([
        ':L', ':-/', '>:/', ':S', '>:[', ':@', ':-(', ':[', ':-||', '=L', ':<',
        ':-[', ':-<', '=\\', '=/', '>:(', ':(', '>.<', ":'-(", ":'(", ':\\', ':-c',
        ':c', ':{', '>:\\', ';('
        ])

    #HappyEmoticons
    emoticons_happy = set([
        ':-)', ':)', ';)', ':o)', ':]', ':3', ':c)', ':>', '=]', '8)', '=)', ':}',
        ':^)', ':-D', ':D', '8-D', '8D', 'x-D', 'xD', 'X-D', 'XD', '=-D', '=D',
        '=-3', '=3', ':-))', ":'-)", ":')", ':*', ':^*', '>:P', ':-P', ':P', 'X-P',
        'x-p', 'xp', 'XP', ':-p', ':p', '=p', ':-b', ':b', '>:)', '>;)', '>:-)',
        '<3'
        ])


    def __init__(self):
        self.stemmer = SnowballStemmer("english", ignore_stopwords=True)
        self.stopwords = set(stopwords.words('english'))
        self.emoticons = self.emoticons_happy.union(self.emoticons_sad)
        

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

        #replace consecutive non-ASCII characters with a space
        tweet = re.sub(r'[^\x00-\x7F]+',' ', tweet)
        
        #remove emojis from tweet
        tweet = self.emoji_pattern.sub(r'', tweet)

        # Tokenize
        tokens = word_tokenize(tweet)
        
        # Init
        filtered_tweet = []

        # Go through words
        for w in tokens:

            #check tokens against stop words, emoticons, punctuations and numerical
            if(w in self.stopwords):
                continue
            elif(w in self.emoticons):
                continue
            elif(w in punctuation):
                continue
            elif(any(char.isdigit() for char in w)):
                continue

            # If clear append
            filtered_tweet.append(w)


        # Join filtered tokens
        tweet = ' '.join(filtered_tweet)

        # Remove leading/trailing whitespaces
        tweet = tweet.strip()
        
        # Make sure there is no punctuation in the characters
        tweet = ''.join([c for c in tweet if c not in punctuation])

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
           