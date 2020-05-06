import csv

PUB_NAMES = ['Elle', 'Cosmopolitan', 'Seventeen']
INPUT_FILES = ['lem/elle_beauty_lem.tsv', 'lem/cosmo_beauty_lem.tsv', 'lem/seventeen_beauty_lem.tsv']
SEARCH_YEARS = ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']

sponsored_headlines_data = []
unsponsored_headlines_data = []
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
	sponsored_headlines_data.append(pub_sponsored_headlines_data)
	unsponsored_headlines_data.append(pub_unsponsored_headlines_data)

keyword = 'perfect'
print('\nkeyword: ' + keyword + '\n')

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
	print(PUB_NAMES[pub_index] + '\n')
	sponsored_prop = pub_sponsored_count / len(pub_sponsored_headlines_data)
	unsponsored_prop = pub_unsponsored_count / len(pub_unsponsored_headlines_data)
	print('sponsored:\t' + str(sponsored_prop))
	print('unsponsored:\t' + str(unsponsored_prop))
	print('\nfactor:\t' + str(sponsored_prop / unsponsored_prop) + '\n\n')
