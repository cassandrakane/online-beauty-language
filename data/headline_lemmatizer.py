import csv
import nltk
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
import string

INPUT_FILE = 'orig/seventeen_beauty_orig.tsv'
OUTPUT_FILE = 'lem/seventeen_beauty_lem.tsv'

def get_wordnet_pos(word):
	"""Map POS tag to first character lemmatize() accepts"""
	tag = nltk.pos_tag([word])[0][1][0].upper()
	tag_dict = {"J": wordnet.ADJ,
				"N": wordnet.NOUN,
				"V": wordnet.VERB,
				"R": wordnet.ADV}
	return tag_dict.get(tag, wordnet.NOUN)

with open(INPUT_FILE,'r') as input_file:
	with open(OUTPUT_FILE, 'w') as output_file:
		reader = csv.reader(input_file, delimiter='\t')
		writer = csv.writer(output_file, delimiter='\t')

		is_header_row = True

		lemmatizer = WordNetLemmatizer()
		lemmatized_data = []
		for row in reader:
			if is_header_row:
				row.append('lemmatized_title')
				is_header_row = False
			else:
				headline = row[0].lower().replace('-', ' ').translate(str.maketrans('', '', string.punctuation))
				headline_words = nltk.word_tokenize(headline)
				lemmatized_headline = []
				for word in headline_words:
					lemmatized_headline.append(lemmatizer.lemmatize(word, get_wordnet_pos(word)))
				row.append(" ".join(lemmatized_headline))
			lemmatized_data.append(row)

		writer.writerows(lemmatized_data)
