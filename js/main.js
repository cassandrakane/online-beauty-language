let hearstHeadlineData = [];
let femMagHeadlineData = {};
let hearstSponsorHeadlineData = [];

queue()
    .defer(d3.tsv,"data/lem/elle_beauty_lem.tsv")
    .defer(d3.tsv,"data/lem/cosmo_beauty_lem.tsv")
    .defer(d3.tsv,"data/lem/seventeen_beauty_lem.tsv")
    .defer(d3.tsv,"data/lem/esquire_beauty_lem.tsv")
    .defer(d3.tsv,"data/spon/all_beauty_headline_keyword_sponsors.tsv")
    .await(wrangleData);

function wrangleData(error, elleHeadlineData, cosmoHeadlineData, seventeenHeadlineData, esquireHeadlineData,
                     sponsorHeadlineData) {
    if  (error) {
        console.log(error);
    }

    femMagHeadlineData = {
        'elle' : {
            'title': 'Elle',
            'data' : elleHeadlineData,
            'color' : "#E57373"
        },
        'cosmopolitan' : {
            'title' : 'Cosmopolitan',
            'data' : cosmoHeadlineData,
            'color' : "#64B5F6"
        },
        'seventeen' : {
            'title' : 'Seventeen',
            'data' : seventeenHeadlineData,
            'color' : "#AED581"
        }
    };


    Object.keys(femMagHeadlineData).forEach(function (magHeadlineDataKey) {
        let headlineData = femMagHeadlineData[magHeadlineDataKey]['data'];
        headlineData.forEach(function (headlineRow) {
            let headline = {
                'title' : headlineRow['title'],
                'href' : headlineRow['href'],
                'dek' : headlineRow['dek'],
                'author' : headlineRow['author'],
                'section' : headlineRow['section'],
                'publishDate' : new Date(headlineRow['publish_date']),
                'thumbnail' : headlineRow['thumbnail'],
                'sponsor' : headlineRow['sponsor'],
                'publication' : femMagHeadlineData[magHeadlineDataKey]['title'],
                'lemmatized_title' : headlineRow['lemmatized_title']
            };
            if ((headline['publishDate'].getFullYear() >= 2012 && headline['publishDate'].getFullYear() <= 2019) ||
                (headline['publishDate'].getFullYear() === 2020 && headline['publishDate'].getMonth()) === 0) {
                hearstHeadlineData.push(headline);
            }
        })
    });

    hearstSponsorHeadlineData = sponsorHeadlineData;

    createVis();
}

function createVis() {
    createOverviewStackedBarChart();
    createYouWordFreqStackedAreaChart();
    createHowWordFreqStackedAreaChart();
    createNeedWordFreqStackedAreaChart();
    createCustomWordFreqStackedAreaChart();
    createSponsorHeadlineTable("sponsor-easy-word-freq-table", hearstSponsorHeadlineData[0]);
    createSponsorHeadlineTable("sponsor-perfect-word-freq-table", hearstSponsorHeadlineData[1]);
    createSponsorHeadlineTable("sponsor-you-word-freq-table", hearstSponsorHeadlineData[2]);
}

function createOverviewStackedBarChart() {
    var vis = this;

    var publicationsList = Object.keys(femMagHeadlineData).map(key => femMagHeadlineData[key]['title']);
    var colorsList = Object.keys(femMagHeadlineData).map(key => femMagHeadlineData[key]['color']);
    vis.overviewStackedBarChart =
        new OverviewStackedBarChart("overview-chart", hearstHeadlineData, publicationsList, colorsList, 'all-prop');
}

function createYouWordFreqStackedAreaChart() {
    var vis = this;

    var youKeyword = "you";
    vis.wordFreqYouAllStackedAreaChart =
        new WordFreqStackedAreaChart("you-all-word-freq-chart", hearstHeadlineData, youKeyword, 1, false, true);
    vis.wordFreqYouElleStackedAreaChart =
        new WordFreqStackedAreaChart(
            "you-elle-word-freq-chart", getDataFilteredByPublication("elle"), youKeyword, 0.5, true, true);
    updateWordFreqColor(vis.wordFreqYouElleStackedAreaChart, "elle");
    vis.wordFreqYouCosmoStackedAreaChart =
        new WordFreqStackedAreaChart(
            "you-cosmo-word-freq-chart", getDataFilteredByPublication("cosmopolitan"), youKeyword, 0.5, true, true);
    updateWordFreqColor(vis.wordFreqYouCosmoStackedAreaChart, "cosmopolitan");
    vis.wordFreqYouSeventeenStackedAreaChart =
        new WordFreqStackedAreaChart(
            "you-seventeen-word-freq-chart", getDataFilteredByPublication("seventeen"), youKeyword, 0.5, true, true);
    updateWordFreqColor(vis.wordFreqYouSeventeenStackedAreaChart, "seventeen");
}

function createHowWordFreqStackedAreaChart() {
    var vis = this;

    var howKeyword = "how";
    vis.wordFreqHowAllStackedAreaChart =
        new WordFreqStackedAreaChart("how-all-word-freq-chart", hearstHeadlineData, howKeyword, 0.75, false, true);
    vis.wordFreqHowElleStackedAreaChart =
        new WordFreqStackedAreaChart(
            "how-elle-word-freq-chart", getDataFilteredByPublication("elle"), howKeyword, 0.45, true, true);
    updateWordFreqColor(vis.wordFreqHowElleStackedAreaChart, "elle");
    vis.wordFreqHowCosmoStackedAreaChart =
        new WordFreqStackedAreaChart(
            "how-cosmo-word-freq-chart", getDataFilteredByPublication("cosmopolitan"), howKeyword, 0.45, true, true);
    updateWordFreqColor(vis.wordFreqHowCosmoStackedAreaChart, "cosmopolitan");
    vis.wordFreqHowSeventeenStackedAreaChart =
        new WordFreqStackedAreaChart(
            "how-seventeen-word-freq-chart", getDataFilteredByPublication("seventeen"), howKeyword, 0.45, true, true);
    updateWordFreqColor(vis.wordFreqHowSeventeenStackedAreaChart, "seventeen");
}

function createNeedWordFreqStackedAreaChart() {
    var vis = this;

    var needKeyword = "need";
    vis.wordFreqNeedAllStackedAreaChart =
        new WordFreqStackedAreaChart("need-all-word-freq-chart", hearstHeadlineData, needKeyword, 0.75, false, true);
    vis.wordFreqNeedElleStackedAreaChart =
        new WordFreqStackedAreaChart(
            "need-elle-word-freq-chart", getDataFilteredByPublication("elle"), needKeyword, 0.45, true, true);
    updateWordFreqColor(vis.wordFreqNeedElleStackedAreaChart, "elle");
    vis.wordFreqNeedCosmoStackedAreaChart =
        new WordFreqStackedAreaChart(
            "need-cosmo-word-freq-chart", getDataFilteredByPublication("cosmopolitan"), needKeyword, 0.45, true, true);
    updateWordFreqColor(vis.wordFreqNeedCosmoStackedAreaChart, "cosmopolitan");
    vis.wordFreqNeedSeventeenStackedAreaChart =
        new WordFreqStackedAreaChart(
            "need-seventeen-word-freq-chart", getDataFilteredByPublication("seventeen"), needKeyword, 0.45, true, true);
    updateWordFreqColor(vis.wordFreqNeedSeventeenStackedAreaChart, "seventeen");
}

function createCustomWordFreqStackedAreaChart() {
    var vis = this;

    vis.customWordFreqStackedAreaChart =
        new WordFreqStackedAreaChart("custom-word-freq-chart", hearstHeadlineData, ' ', 1, false, false);
}

function createSponsorHeadlineTable(tableId, data) {
    var table = document.getElementById(tableId);
    var header = table.createTHead();
    header.className += 'thead-light';
    var headerRow = header.insertRow(0);
    var headerPubCell = document.createElement('th');
    headerPubCell.innerHTML = 'Publication';
    headerRow.appendChild(headerPubCell);
    var headerSponPropCell = document.createElement('th');
    headerSponPropCell.innerHTML = 'Proportion of Sponsored Articles';
    headerRow.appendChild(headerSponPropCell);
    var headerUnsponPropCell = document.createElement('th');
    headerUnsponPropCell.innerHTML = 'Proportion of Unsponsored Articles';
    headerRow.appendChild(headerUnsponPropCell);
    var headerSponRatio = document.createElement('th');
    headerSponRatio.innerHTML = 'Sponsored Likelihood Ratio';
    headerRow.appendChild(headerSponRatio);

    var body = table.createTBody();
    var elleRow = body.insertRow();
    var ellePubCell = elleRow.insertCell(0);
    var elleSponPropCell = elleRow.insertCell(1);
    var elleUnsponPropCell = elleRow.insertCell(2);
    var elleSponRatio = elleRow.insertCell(3);
    ellePubCell.innerHTML = 'Elle';
    elleSponPropCell.innerHTML = data['elle_spon_prop'];
    elleUnsponPropCell.innerHTML = data['elle_unspon_prop'];
    elleSponRatio.innerHTML = data['elle_spon_ratio'];
    var cosmoRow = body.insertRow();
    var cosmoPubCell = cosmoRow.insertCell(0);
    var cosmoSponPropCell = cosmoRow.insertCell(1);
    var cosmoUnsponPropCell = cosmoRow.insertCell(2);
    var cosmoSponRatio = cosmoRow.insertCell(3);
    cosmoPubCell.innerHTML = 'Cosmopolitan';
    cosmoSponPropCell.innerHTML = data['cosmo_spon_prop'];
    cosmoUnsponPropCell.innerHTML = data['cosmo_unspon_prop'];
    cosmoSponRatio.innerHTML = data['cosmo_spon_ratio'];
    var seventeenRow = body.insertRow();
    var seventeenPubCell = seventeenRow.insertCell(0);
    var seventeenSponPropCell = seventeenRow.insertCell(1);
    var seventeenUnsponPropCell = seventeenRow.insertCell(2);
    var seventeenSponRatio = seventeenRow.insertCell(3);
    seventeenPubCell.innerHTML = 'Seventeen';
    seventeenSponPropCell.innerHTML = data['seventeen_spon_prop'];
    seventeenUnsponPropCell.innerHTML = data['seventeen_unspon_prop'];
    seventeenSponRatio.innerHTML = data['seventeen_spon_ratio'];
    var allRow = body.insertRow();
    allRow.className += 'table-primary';
    var allPubCell = allRow.insertCell(0);
    var allSponPropCell = allRow.insertCell(1);
    var allUnsponPropCell = allRow.insertCell(2);
    var allSponRatio = allRow.insertCell(3);
    allPubCell.innerHTML = 'All';
    allSponPropCell.innerHTML = data['all_spon_prop'];
    allUnsponPropCell.innerHTML = data['all_unspon_prop'];
    allSponRatio.innerHTML = data['all_spon_ratio'];
}


function getDataFilteredByPublication(publicationValue) {
    var filteredHearstHeadlineData = [];
    if (publicationValue === 'elle' || publicationValue === 'cosmopolitan' || publicationValue === 'seventeen') {
        hearstHeadlineData.forEach(function (headline) {
            if (headline.publication.toLowerCase() === publicationValue) {
                filteredHearstHeadlineData.push(headline);
            }
        });
    } else {
        filteredHearstHeadlineData = hearstHeadlineData;
    }
    return filteredHearstHeadlineData;
}

function updateOverviewChart() {
    var vis = this;
    var selectPublicationValue = d3.select('#overview-chart-select-publication').property("value");

    vis.overviewStackedBarChart.filteredData = getDataFilteredByPublication(selectPublicationValue);
    vis.overviewStackedBarChart.selectPublicationValue = selectPublicationValue;
    vis.overviewStackedBarChart.wrangleData();
}

function updateCustomWordFreqAxes() {
    var vis = this;

    vis.customWordFreqStackedAreaChart.wrangleData();
}

function updateCustomWordFreqPub() {
    var vis = this;
    var selectPublicationValue = d3.select('#word-freq-pub-select-box').property("value");

    updateWordFreqColor(vis.customWordFreqStackedAreaChart, selectPublicationValue);

    vis.customWordFreqStackedAreaChart.filteredData = getDataFilteredByPublication(selectPublicationValue);
    vis.customWordFreqStackedAreaChart.wrangleData();
}

function updateWordFreqColor(wordFreqAreaChart, publication) {
    if (publication in femMagHeadlineData) {
        wordFreqAreaChart.fillColor = femMagHeadlineData[publication]['color'];
    } else {
        wordFreqAreaChart.fillColor = "#BA68C8";
    }
    wordFreqAreaChart.updateVis();
}

function submitWord() {
    var vis = this;

    vis.customWordFreqStackedAreaChart.word = d3.select('#word').property("value");
    vis.customWordFreqStackedAreaChart.wrangleData();
}

function updateWordFreqSearchType() {
    var vis = this;

    vis.customWordFreqStackedAreaChart.wrangleData();
}
