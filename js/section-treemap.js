/*
 * SectionTreemap - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data	            -- publication data
 */

SectionTreemap = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;

    this.initVis();
};

SectionTreemap.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 50, bottom: 40, left: 90};
    vis.width = 1100 - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.color = d3.scaleOrdinal()
        .domain(["Elle", "Cosmopolitan", "Seventeen"])
        .range(["#E57373", "#64B5F6", "#AED581"]);

    vis.wrangleData();
};

SectionTreemap.prototype.wrangleData = function() {
    var vis = this;

    var nestedData = d3.nest()
        .key(function (d) {
            return d.publication;
        })
        .key(function (d) {
            return d.section;
        })
        .rollup(function (d) {
            return d.length;
        })
        .entries(vis.filteredData);

    var flattenedData = [
        {
            'name' : 'All',
            'parent' : ''
        },
        {
            'name' : 'Elle',
            'parent' : 'All'
        },
        {
            'name' : 'Cosmopolitan',
            'parent' : 'All'
        },
        {
            'name' : 'Seventeen',
            'parent' : 'All'
        }
    ];
    nestedData.forEach(function (publication) {
        publication.values.forEach(function (section) {
            var d = {
                'name' : section.key,
                'parent' : publication.key,
                'value' : section.value
            };
            flattenedData.push(d)
        });
    });

    vis.displayData = flattenedData;
    vis.updateVis();
};

SectionTreemap.prototype.updateVis = function(){
    var vis = this;

    var root = d3.stratify()
        .id(function(d) { return d.name; })
        .parentId(function(d) { return d.parent; })
        (vis.displayData);
    root.sum(function(d) { return +d.value });

    d3.treemap()
        .size([vis.width, vis.height])
        .padding(4)
        (root);

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return d.data.name + " (" + d.data.parent + ")";
        });

    vis.svg.call(tool_tip);

    var rect = vis.svg.selectAll("rect")
        .data(root.leaves());

    rect.enter()
        .append("rect")
        .style("stroke", "black")
        .style("fill", function (d) { return vis.color(d.data.parent) })
        .merge(rect)
        .on("mouseover", tool_tip.show)
        .on("mouseout", tool_tip.hide)
        .transition()
        .duration(800)
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; });

    rect.exit().remove();

    var text = vis.svg.selectAll("text")
        .data(root.leaves());

    text.enter()
        .append("text")
        .attr("font-size", "12px")
        .attr("fill", "white")
        .merge(text)
        .transition()
        .duration(800)
        .text(function(d) {
            var label = d.data.name;
            if (d.x1 - d.x0 - 20 > 100) {
                return label;
            }
            return '';
        })
        .attr("x", function(d) { return d.x0 + 10 })
        .attr("y", function(d) { return d.y0 + 20 });

    text.exit().remove();
};