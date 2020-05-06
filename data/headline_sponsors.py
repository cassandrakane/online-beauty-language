import csv

PUB_NAMES = ['Elle', 'Cosmopolitan', 'Seventeen']
SEARCH_YEARS = ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']
INPUT_FILES = ['lem/elle_beauty_lem.tsv', 'lem/cosmo_beauty_lem.tsv', 'lem/seventeen_beauty_lem.tsv']
OUTPUT_FILE = 'spon/all_beauty_headline_keyword_sponsors.tsv'

sponsored_headlines_data = []
unsponsored_headlines_data = []
sponsors = []
for file in INPUT_FILES:
	pub_sponsored_headlines_data = []
	pub_unsponsored_headlines_data = []
	with open(file, 'r') as input_file:
		reader = csv.reader(input_file, delimiter='\t')
		for row in reader:
			headline = row[8]
			sponsor = row[7]
			year = row[5][:4]
			month = row[5][5:7]
			headline_data = {
				'headline' : headline,
				'sponsor' : sponsor
			}
			if year in SEARCH_YEARS or (year == '2020' and month == '01'):
				if sponsor == '':
					pub_unsponsored_headlines_data.append(headline_data)
				else:
					pub_sponsored_headlines_data.append(headline_data)
					sponsors.append(sponsor)
	sponsored_headlines_data.append(pub_sponsored_headlines_data)
	unsponsored_headlines_data.append(pub_unsponsored_headlines_data)

KEYWORDS = ['easy', 'perfect', 'you']
keyword_data_rows = []
for keyword in KEYWORDS:
	all_sponsored_count = 0
	all_unsponsored_count = 0
	keyword_row = [keyword]
	for pub_index in range(3):
		pub_sponsored_headlines_data = sponsored_headlines_data[pub_index]
		pub_unsponsored_headlines_data = unsponsored_headlines_data[pub_index]
		pub_sponsored_count = 0
		for headline_data in pub_sponsored_headlines_data:
			if keyword in headline_data['headline']:
				pub_sponsored_count += 1
		pub_unsponsored_count = 0
		for headline_data in pub_unsponsored_headlines_data:
			if keyword in headline_data['headline']:
				pub_unsponsored_count += 1
		sponsored_prop = pub_sponsored_count / len(pub_sponsored_headlines_data)
		unsponsored_prop = pub_unsponsored_count / len(pub_unsponsored_headlines_data)
		pub_keyword_row = [sponsored_prop, unsponsored_prop, sponsored_prop / unsponsored_prop]
		keyword_row.extend(pub_keyword_row)
		all_sponsored_count += pub_sponsored_count
		all_unsponsored_count += pub_unsponsored_count
	all_sponsored_prop = all_sponsored_count / (len(sponsored_headlines_data[0]) + len(sponsored_headlines_data[1]) + len(sponsored_headlines_data[2]))
	all_unsponsored_prop = all_unsponsored_count / (len(unsponsored_headlines_data[0]) + len(unsponsored_headlines_data[1]) + len(unsponsored_headlines_data[2]))
	pub_keyword_row = [all_sponsored_prop, all_unsponsored_prop, all_sponsored_prop / all_unsponsored_prop]
	keyword_row.extend(pub_keyword_row)
	keyword_data_rows.append(keyword_row)

with open(OUTPUT_FILE, 'w') as output_file:
	writer = csv.writer(output_file, delimiter='\t')
	writer.writerow(['keyword', 'elle_prop_spon', 'elle_prop_unspon', 'elle_spon_factor',
		'cosmo_prop_spon', 'cosmo_prop_unspon', 'cosmo_spon_factor',
		'seventeen_prop_spon', 'seventeen_prop_unspon', 'seventeen_spon_factor',
		'all_prop_spon', 'all_prop_unspon', 'all_spon_factor'])
	writer.writerows(keyword_data_rows)
