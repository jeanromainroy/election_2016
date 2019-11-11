from scipy.sparse import csr_matrix
import numpy as np
import math
from nltk.tokenize import word_tokenize
from tqdm import tqdm_notebook as tqdm

class BagOfWorder():

    def __init__(self, words):
        """
        pipelineObj: instance of PreprocesingPipeline
        bigram: enable or disable bigram
        trigram: enable or disable trigram
        words: list of words in the vocabulary
        """
        self.words = words
        
        
    def computeLine(self, tweet):

        if self.words is None:
            raise Exception(
                "ERROR: You have not provided the dictionary"
            )
        
        # Tokenize
        tokens = word_tokenize(tweet)
        
        # Init the BoW Matrix
        matrixBoW = np.zeros((1, len(self.words)),dtype=np.int16)
        
        # Go through each tokenized tweet
        for token in tokens:
                
            try:
                # Get the dictionary index of this token
                dictIndex = self.words.index(token)

                # Increment the BoW row at this index
                matrixBoW[0][dictIndex] += 1

            except ValueError:
                pass
        
        # Return the BoW Matrix
        return matrixBoW
    
        
    def computeMatrix(self, tweets):
        """
        Calcule du BoW, à partir d'un dictionnaire de mots et d'une liste de tweets.
        On suppose que l'on a déjà collecté le dictionnaire sur l'ensemble d'entraînement.
        
        Entrée: tokens, une liste de vecteurs contenant les tweets (une liste de liste)
        
        Return: une csr_matrix
        """
        
        if self.words is None:
            raise Exception(
                "ERROR: You have not provided the dictionary"
            )
        
        
        # Init empty arrays
        row = []
        col = []
        data = []
        
        # Nbr of tweets
        nbrOfTweets = len(tweets)

        # Go through tweets
        for j, t in tqdm(enumerate(tweets), total=nbrOfTweets):

            # Go through dictionary words
            for i, w in enumerate(self.words):

                tf_ij = t.count(w)

                if(tf_ij):
                    row.append(j)
                    col.append(i)
                    data.append(tf_ij)

        # Build the CSR Matrix
        matrixBoW = csr_matrix((data, (row, col)), shape=(len(tweets), len(self.words)))
        
        # Return the BoW Matrix
        return matrixBoW   



    def computeTFIDF(self, matrixBoW):

        # Prompt User
        print("Normalizing using TFIDF...")
        
        # Transpose the matrix
        invMatrixBoW = matrixBoW.T.astype('float32') 
        
        # Get the matrix length
        matrixLength = invMatrixBoW.shape[0]
        nbrOfTweets = invMatrixBoW.shape[1]
        
        # Go through the colums (words)
        for i in range(0,matrixLength):
            
            # Get the column
            column = invMatrixBoW[i]
            
            # Count the number of tweets containing that word
            dfi = np.count_nonzero(column.toarray())
            
            # Check if dfi is positive
            if(dfi == 0):
                dfi = 1
        
            # Get the logarithmic ratio
            idfi = math.log(nbrOfTweets/dfi)
            
            # Go through each element of the column
            invMatrixBoW[i] = column*idfi
            
        
        # Convert to CSR
        matrixTFIDF = csr_matrix(invMatrixBoW.T, dtype=np.float32)
        
        # Return the matrixTFIDF Matrix
        return matrixTFIDF