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

    vis.sectionTreemap = new SectionTreemap("section-treemap", []);
    var sectionYearSlider = document.getElementById("section-treemap-years");
    sectionYearSlider.value = "2019";
    updateSectionMap();

    vis.wordFreqStackedAreaChart = new WordFreqStackedAreaChart("word-freq-chart", hearstHeadlineData, ' ');
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

function updateSectionMap() {
    var vis = this;
    var selectSectionYear = d3.select('#section-treemap-years').property("value");

    var sectionYearSlider = document.getElementById("section-treemap-year-label");
    sectionYearSlider.innerHTML = "Year: " + selectSectionYear;

    // TODO cache
    var filteredHearstHeadlineData = [];
    hearstHeadlineData.forEach(function (headline) {
        if (headline.publishDate.getFullYear() === +selectSectionYear) {
            filteredHearstHeadlineData.push(headline);
        }
    });

    vis.sectionTreemap.filteredData = filteredHearstHeadlineData;
    vis.sectionTreemap.wrangleData();
}

function updateWordFreqAxes() {
    var vis = this;

    vis.wordFreqStackedAreaChart.wrangleData();
}

function updateWordFreqPub() {
    var vis = this;
    var selectPublicationValue = d3.select('#word-freq-pub-select-box').property("value");

    vis.wordFreqStackedAreaChart.filteredData = getDataFilteredByPublication(selectPublicationValue);
    if (selectPublicationValue in femMagHeadlineData) {
        vis.wordFreqStackedAreaChart.fillColor = femMagHeadlineData[selectPublicationValue]['color'];
    } else {
        vis.wordFreqStackedAreaChart.fillColor = "#BA68C8";
    }

    vis.wordFreqStackedAreaChart.wrangleData();
}

function submitWord() {
    var vis = this;
    var word = d3.select('#word').property("value");

    vis.wordFreqStackedAreaChart.word = word;
    vis.wordFreqStackedAreaChart.wrangleData();
}
