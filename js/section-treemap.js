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
    vis.width = 900 - vis.margin.left - vis.margin.right;
    vis.height = 350 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.z = d3.scaleOrdinal(["#EF9A9A", "#90CAF9", "#C5E1A5"]);

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

    vis.svg.selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function (d) {
            // TODO abstract out colors
            if (d.data.parent === 'Elle') {
                return "#EF9A9A";
            }
            if (d.data.parent === 'Cosmopolitan') {
                return "#90CAF9";
            }
            if (d.data.parent === 'Seventeen') {
                return "#C5E1A5";
            }
            return "#000000";
        });

    vis.svg.selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", function(d) { return d.x0 + 10 })
        .attr("y", function(d) { return d.y0 + 20 })
        .text(function(d) { return d.data.name})
        .attr("font-size", "14px")
        .attr("fill", "white")
};