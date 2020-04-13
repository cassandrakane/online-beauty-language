/*
 * StackedBarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data	            -- publication data
 * @param _publications     -- list of publications
 */

StackedBarChart = function(_parentElement, _data, _publications){
    this.parentElement = _parentElement;
    this.data = _data;
    this.publications = _publications;
    this.filteredData = this.data;

    this.initVis();
};

StackedBarChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 50, bottom: 40, left: 90};

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 350 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.05)
        .align(0.1);

    vis.y = d3.scaleLinear()
        .rangeRound([vis.height, 0])
        .nice();

    vis.z = d3.scaleOrdinal(d3.schemeCategory10);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("text")
        .attr("transform",
            "translate(" + (vis.width / 2) + " ," +
            (vis.height + vis.margin.top + 8) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Year");

    vis.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - vis.margin.left)
        .attr("x", 0 - (vis.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Title Length");

    vis.wrangleData();
};

StackedBarChart.prototype.wrangleData = function() {
    var vis = this;

    var formatDate = d3.timeFormat("%m/%y");
    var nestedData = d3.nest()
        .key(function (d) {
            return formatDate(d.publishDate);
        })
        .key(function (d) {
            return d.publication;
        })
        .rollup(function (d) {
            return d.length;
        })
        .entries(vis.filteredData);

    var allData = [];
    nestedData.forEach(function (date) {
        var publicationCounts = date.values;
        vis.publications.forEach(function (pubTitle, i) {
            if (i >= publicationCounts.length || publicationCounts[i].key !== pubTitle) {
                publicationCounts.splice(i, 0, {
                    'key' : pubTitle,
                    'value' : 0
                })
            }
        });
        publicationCounts.forEach(function (p) {
            var d = {
                'publication' : p.key,
                'publishDate' : date.key,
                'count' : p.value
            };
            allData.push(d);
        });
    });

    vis.displayData = allData;


    // Update the visualization
    vis.updateVis();
};

StackedBarChart.prototype.updateVis = function(){
    var vis = this;

    var nestedData = d3.nest()
        .key(function(d) { return d.publishDate; })
        .key(function(d) { return d.publication; })
        .rollup(function(v) { return d3.sum(v, function(d) { return d.count; }); })
        .entries(vis.displayData);

    var dates = nestedData.map(function(d) { return d.key; });
    var dataStack = [];

    nestedData.forEach(function(d, i) {
        d.values = d.values.map(function(e) { return e.value; });
        var t = {};
        vis.publications.forEach(function(e, i) {
            t[e] = d.values[i]
        });
        t.publishDate = d.key;
        dataStack.push(t)
    });

    var layers = d3.stack().keys(vis.publications)(dataStack);
    var max = d3.max(layers[layers.length - 1], function(d) { return d[1]; });

    vis.x.domain(dates.reverse());
    vis.y.domain([0, max]);

    var rect = vis.svg.append("g").selectAll("g")
        .data(layers);

    rect.enter()
        .append("g")
        .style("fill", function(d) { return vis.z(d.key); })
        .selectAll("rect")
        .data(function(d) {  return d; })
        .enter().append("rect")
        .attr("x", function(d) { return vis.x(d.data.publishDate); })
        .attr("y", function(d) { return vis.y(d[1]); })
        .attr("height", function(d) { return vis.y(d[0]) - vis.y(d[1]); })
        .attr("width", vis.x.bandwidth());

    rect.exit().remove();

    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};