let hearstHeadlineData = [];

queue()
    .defer(d3.tsv,"data/elle_beauty.tsv")
    .defer(d3.tsv,"data/esquire_beauty.tsv")
    .defer(d3.tsv,"data/marie_beauty.tsv")
    .defer(d3.tsv,"data/seventeen_beauty.tsv")
    .await(wrangleData);

function wrangleData(error, elleHeadlineData, esquireHeadlineData, marieHeadlineData, seventeenHeadlineData) {
    if  (error) {
        console.log(error);
    }

    let femMagHeadlineData = [
        {
            'title' : 'Elle',
            'data' : elleHeadlineData
        },
        {
            'title' : 'Seventeen',
            'data' : seventeenHeadlineData
        },
        {
            'title' : 'Marie Claire',
            'data' : marieHeadlineData
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
            if (headline['publishDate'].getFullYear() >= 2010 && headline['publishDate'].getFullYear() <= 2019) {
                hearstHeadlineData.push(headline);
            }
        })
    });

    createVis();
}

function createVis() {
    var vis = this;

    // TODO abstract out publications list
    vis.stackedbarchart = new StackedBarChart("stackedbarchart", hearstHeadlineData, ['Elle', 'Seventeen', 'Marie Claire']);
}

// function submitWord() {
//     var vis = this;
//     var word = d3.select('#word').property("value");
//
//     vis.scatterplot.word = word;
//     vis.scatterplot.wrangleData();
// }
