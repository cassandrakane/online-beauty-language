/*
 * WordFreqStackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the data
 */

WordFreqStackedAreaChart = function(_parentElement, _data, _word){
    this.parentElement = _parentElement;
    this.data = _data;
    this.word = _word;
    this.displayData = []; // see data wrangling
    this.filteredData = this.data;
    this.fillColor = "#BA68C8";

    this.initVis();
};

WordFreqStackedAreaChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 130, bottom: 30, left: 80};

    vis.width = 900 - vis.margin.left - vis.margin.right;
    vis.height = 300 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    var parseDate = d3.timeParse("%m/%y");
    vis.area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return vis.x(parseDate(d.data.publishDate)); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    vis.x = d3.scaleTime()
        .range([1, vis.width - 1]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.yLabel = vis.svg.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", 0 - (vis.height / 2))
        .style("text-anchor", "middle");

    vis.yValue = d3.select("#word-freq-y-select-box").property("value");
    vis.wrangleData();
};

function cleanText(text) {
    return text.toLowerCase().replace("\-", " ").replace(/[.,\/#!$%\^&\*;:{}=_`~()\'\"]/g, "");
}

function wordInHeadline(word, headline) {
    return cleanText(headline).split(" ").includes(cleanText(word));
}

WordFreqStackedAreaChart.prototype.wrangleData = function(){
    var vis = this;

    vis.yValue = d3.select("#word-freq-y-select-box").property("value");
    vis.parameters = [];
    if (vis.yValue === "proportion") {
        vis.parameters = ["propContain", "propNotContain"];
    } else if (vis.yValue === "count") {
        vis.parameters = ["countContain", "countNotContain"];
    } else if (vis.yValue === "all-count") {
        vis.parameters = ["allCountContain", "allCountNotContain"];
    }

    var formatDate = d3.timeFormat("%m/%y");
    vis.nestedWordFreqData = d3.nest()
        .key(function(d) { return formatDate(d.publishDate); })
        .rollup(function(v) {
            // TODO implement conditional
            return {
                'count' : v.length,
                'propContain' : d3.sum(v, function(d) {
                    return wordInHeadline(vis.word, d.lemmatized_title);
                }) / v.length,
                'propNotContain' : (v.length - d3.sum(v, function(d) {
                    return wordInHeadline(vis.word, d.lemmatized_title);
                })) / v.length,
                'countContain' : d3.sum(v, function(d) {
                    return wordInHeadline(vis.word, d.lemmatized_title);
                }),
                'countNotContain' : v.length - d3.sum(v, function(d) {
                    return wordInHeadline(vis.word, d.lemmatized_title);
                }),
                'allCountContain' : d3.sum(v, function(d) {
                    return wordInHeadline(vis.word, d.lemmatized_title);
                }),
                'allCountNotContain' : v.length - d3.sum(v, function(d) {
                    return wordInHeadline(vis.word, d.lemmatized_title);
                }),
            };
        })
        .entries(vis.filteredData);

    vis.wordFreqData = [];
    for (var i = 0; i < vis.nestedWordFreqData.length; i++) {
        vis.wordFreqData.push({
            'publishDate' : vis.nestedWordFreqData[i].key,
            'contain' : vis.nestedWordFreqData[i].value[vis.parameters[0]],
            'notContain' : vis.nestedWordFreqData[i].value[vis.parameters[1]]
        })
    }

    vis.wordFreqData = vis.wordFreqData.reverse();

    vis.dataCategories = ["contain", "notContain"];
    var stack = d3.stack()
        .keys(vis.dataCategories);

    vis.stackedData = stack(vis.wordFreqData);
    vis.displayData = vis.stackedData;

    vis.updateVis();
};

WordFreqStackedAreaChart.prototype.updateVis = function(){
    var vis = this;

    var selectedText = d3.select('#word-freq-y-select-box option:checked').text();
    vis.yLabel.text(selectedText);

    var parseDate = d3.timeParse("%m/%y");
    vis.x.domain(d3.extent(vis.wordFreqData, function(d) { return parseDate(d.publishDate); }));
    vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d3.max(d, function(e) {
            if (vis.parameters[0] === "propContain" || vis.parameters[0] === 'countContain') {
                return e[0];
            }
            return e[1];
        });
    })]);

    // Legend color blocks
    var legend = vis.svg.selectAll("rect.legend")
        .data(vis.dataCategories.slice().reverse());

    legend.enter().append("rect")
        .attr("class", "legend")
        .attr("width", 15)
        .attr("height", 15)
        .merge(legend)
        .transition()
        .duration(800)
        .attr("x", vis.width + 20)
        .attr("y", function(d, i) { return i * 25; })
        .attr("fill", function(d){
            if (d === "contain") {
                return vis.fillColor;
            }
            return "#E0E0E0";
        });

    legend.exit().remove();

    var labels = vis.svg.selectAll("text.legend")
        .data(vis.dataCategories.slice().reverse());

    labels.enter().append("text")
        .attr("class", "legend")
        .merge(labels)
        .transition()
        .duration(800)
        .attr("x", vis.width + 40)
        .attr("y", function(d, i) { return i * 25 + 10; })
        .text(function(d) { return d; });

    labels.exit().remove();

    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .transition()
        .duration(800)
        .style("fill", function(d) {
            if (d.key === "contain") {
                return vis.fillColor;
            }
            return "#E0E0E0";
        })
        .style("opacity", function(d) {
            if ((vis.parameters[0] === "propContain" || vis.parameters[0] === "countContain")
                && d.key === "notContain") {
                return 0;
            }
            return 1;
        })
        .attr("d", function(d) {
            return vis.area(d);
        });

    categories.exit().remove();

    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis")
        .transition()
        .duration(800)
        .call(vis.yAxis);
};