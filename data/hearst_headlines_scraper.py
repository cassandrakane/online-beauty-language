import csv
import pathlib
import requests
import time
from bs4 import BeautifulSoup
from selenium import webdriver

URL_BASE = 'https://www.elle.com'
URL_EXT = '/beauty/'
WRITE_FILE = '/orig/elle_beauty_orig.tsv'
CUR_PATH = pathlib.Path().absolute();

options = webdriver.ChromeOptions()
options.add_argument('--incognito')
options.add_argument('--headless')
driver = webdriver.Chrome('{}/chromedriver'.format(CUR_PATH), options=options)
driver.get(URL_BASE + URL_EXT)

def cleanText(t):
	return " ".join(t.split())

NUM_OF_LOADS = 100
i = 0
error_count = 0
while i < NUM_OF_LOADS:
	driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
	more_buttons = driver.find_elements_by_class_name("load-more")
	try:
		element = more_buttons[i]
		driver.execute_script("arguments[0].click();", element)
	except IndexError:
		print("ERROR: unable to load index " + str(i) + ", attempting again.")
		i -= 1
		error_count += 1
		if error_count > 50:
			break
	time.sleep(1)
	i += 1
	error_count = 0
page_source = driver.page_source

html = BeautifulSoup(page_source, 'html.parser')
articles = []
for item in html.findAll('div', {'class' : 'full-item'}):
	titles = item.findAll('a', {'class' : 'full-item-title'})
	dates = item.findAll('div', {'class' : 'publish-date'})
	if len(titles) != 1 or len(dates) != 1:
		print("ERROR: skipping item, missing title or publication date.")
		continue
	sections = item.findAll('a', {'class' : 'full-item-parent-link'})
	section = '' if len(sections) == 0 else cleanText(sections[0].text)
	deks = item.findAll('div', {'class' : 'full-item-dek'})
	dek =  '' if len(deks) == 0 else cleanText(deks[0].text)
	authors = item.findAll('span', {'class' : 'byline-name'})
	author = '' if len(authors) == 0 else cleanText(authors[0].text)
	images = item.findAll('img', {'class' : 'lazyimage'})
	image = '' if len(images) == 0 else images[0]['data-src']
	sponsors = item.findAll('div', {'class' : 'sponsor-image'})
	sponsor = '' if len(sponsors) == 0 else cleanText(sponsors[0].text)
	a = {
		'title' : cleanText(titles[0].text),
		'href' : URL_BASE + titles[0]['href'],
		'publish_date' : dates[0]['data-publish-date'],
		'dek' : dek,
		'section' : section,
		'author' : author,
		'thumbnail' : image,
		'sponsor' : sponsor
	}
	articles.append(a)

with open(WRITE_FILE, 'w') as file:
	writer = csv.writer(file, delimiter='\t')
	writer.writerow(['title', 'href', 'dek', 'section', 'author', 'publish_date', 'thumbnail', 'sponsor'])
	for a in articles:
		writer.writerow([a['title'], a['href'], a['dek'], a['section'], a['author'], a['publish_date'], a['thumbnail'], a['sponsor']])
