let hearstHeadlineData = [];
let femMagHeadlineData = {};

queue()
    .defer(d3.tsv,"data/lem/elle_beauty_lem.tsv")
    .defer(d3.tsv,"data/lem/cosmo_beauty_lem.tsv")
    .defer(d3.tsv,"data/lem/seventeen_beauty_lem.tsv")
    .defer(d3.tsv,"data/lem/esquire_beauty_lem.tsv")
    .await(wrangleData);

function wrangleData(error, elleHeadlineData, cosmoHeadlineData, seventeenHeadlineData, esquireHeadlineData) {
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

    createVis();
}

function createVis() {
    var vis = this;

    var publicationsList = Object.keys(femMagHeadlineData).map(key => femMagHeadlineData[key]['title']);
    var colorsList = Object.keys(femMagHeadlineData).map(key => femMagHeadlineData[key]['color']);
    vis.overviewStackedBarChart =
        new OverviewStackedBarChart("overview-chart", hearstHeadlineData, publicationsList, colorsList, 'all-prop');

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

    vis.customWordFreqStackedAreaChart =
        new WordFreqStackedAreaChart("custom-word-freq-chart", hearstHeadlineData, ' ', 1, false, false);
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
