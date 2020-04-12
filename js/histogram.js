/*
 * Histogram - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

Histogram = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    this.displayData = []; // see data wrangling

    this.initVis();
};

Histogram.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 50, bottom: 40, left: 90};

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 350 - vis.margin.top - vis.margin.bottom;

    var formatDate = d3.timeFormat("%m/%y");

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x = d3.scaleTime()
        .rangeRound([0, vis.width])
        .domain([new Date(2010, 0, 1), new Date(2020, 0, 1)]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(formatDate);

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

Histogram.prototype.wrangleData = function() {
    var vis = this;

    var headlineDatesHistogramData = [];
    vis.filteredData.forEach(function (headline) {
        headlineDatesHistogramData.push(headline.publishDate);
    });
    vis.displayData = headlineDatesHistogramData;

    // Update the visualization
    vis.updateVis();
};

Histogram.prototype.updateVis = function(){
    var vis = this;

    var histogram = d3.histogram()
        .value(function(d) { return d; })
        .domain(vis.x.domain())
        .thresholds(vis.x.ticks(d3.timeMonth));

    // group the data for the bars
    var bins = histogram(vis.displayData);

    // Scale the range of the data in the y domain
    vis.y.domain([0, d3.max(bins, function(d) { return d.length; })]);

    var rect = vis.svg.selectAll("rect")
        .data(bins);

    rect.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + vis.x(d.x0) + "," + vis.y(d.length) + ")"; })
        .attr("width", function(d) { return vis.x(d.x1) - vis.x(d.x0) -1; })
        .attr("height", function(d) { return vis.height - vis.y(d.length); });

    rect.exit().remove();

    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};