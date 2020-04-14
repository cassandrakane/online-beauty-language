let hearstHeadlineData = [];

queue()
    .defer(d3.tsv,"data/elle_beauty.tsv")
    .defer(d3.tsv,"data/cosmo_beauty.tsv")
    .defer(d3.tsv,"data/seventeen_beauty.tsv")
    .defer(d3.tsv,"data/esquire_beauty.tsv")
    .await(wrangleData);

function wrangleData(error, elleHeadlineData, cosmoHeadlineData, seventeenHeadlineData, esquireHeadlineData) {
    if  (error) {
        console.log(error);
    }

    let femMagHeadlineData = [
        {
            'title' : 'Elle',
            'data' : elleHeadlineData
        },
        {
            'title' : 'Cosmopolitan',
            'data' : cosmoHeadlineData
        },
        {
            'title' : 'Seventeen',
            'data' : seventeenHeadlineData
        }
    ];

    femMagHeadlineData.forEach(function (magHeadlineData) {
        let headlineData = magHeadlineData['data'];
        headlineData.forEach(function (headlineRow) {
            let headline = {
                'title' : headlineRow['title'],
                'href' : headlineRow['href'],
                'dek' : headlineRow['dek'],
                'author' : headlineRow['author'],
                'publishDate' : new Date(headlineRow['publish_date']),
                'thumbnail' : headlineRow['thumbnail'],
                'sponsor' : headlineRow['sponsor'],
                'publication' : magHeadlineData['title']
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

    var publicationsList = ['Elle', 'Cosmopolitan', 'Seventeen'];
    vis.overviewStackedBarChart = new OverviewStackedBarChart("overview-chart", hearstHeadlineData, publicationsList);
}

function updateChart() {
    var vis = this;
    var selectPublicationValue = d3.select('#overview-chart-select-publication').property("value");

    var filteredHearstHeadlineData = [];
    if (selectPublicationValue === 'All') {
        filteredHearstHeadlineData = hearstHeadlineData;
    } else {
        hearstHeadlineData.forEach(function (headline) {
            if (headline.publication === selectPublicationValue) {
                filteredHearstHeadlineData.push(headline);
            }
        });
    }

    vis.overviewStackedBarChart.filteredData = filteredHearstHeadlineData;
    vis.overviewStackedBarChart.wrangleData();
}

function submitWord() {
    var vis = this;
    var word = d3.select('#word').property("value");

    // TODO implement
}
