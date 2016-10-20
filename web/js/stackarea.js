/**
 * Created by motu on 2016/10/20.
 */
var w = 600;                        //width
var h = 500;                        //height
var padding = {top: 40, right: 40, bottom: 40, left:40};
var dataset;
//Set up stack method
var stack = d3.layout.stack();
//   d3.time.format('%Y-%m-%d').parse
d3.json("mperday.json",function(json) {
    dataset = json;

    //Data, stacked
    stack(dataset);
    console.log(dataset);
    var color_hash = {
        0: ["洗衣液", "#6060FF"],
        1: ["洗手液", "#8096FF"],
        2: ["家庭清洁", "#CDD2FF"]

    };


    //Set up scales

    /*        var xScale = d3.time.scale()
     .domain([new Date(dataset[0][0].time),d3.time.day.offset(new Date(dataset[0][dataset[0].length-1].time),8)])
     .rangeRound([0, w-padding.left-padding.right]);

     var yScale = d3.scale.linear()
     .domain([0,
     d3.max(dataset, function(d) {
     return d3.max(d, function(d) {
     return d.y0 + d.y;
     });
     })
     ])
     .range([h-padding.bottom-padding.top,0]);*/

// d3.time.format('%Y-%m-%d').parse

    var xScale = d3.time.scale()
        .range([0, w - padding.left - padding.right])
        .domain([new Date(dataset[0][0].time), d3.time.day.offset(new Date(dataset[0][dataset[0].length - 1].time), 2)]);
    //.domain(d3.extent(dataset, function (d) { return d.time; }));

    var yScale = d3.scale.linear()
        .range([h - padding.bottom - padding.top, 0])
        .domain([0, d3.max(dataset, function (d) {
            return d3.max(d, function (d) {
                return d.y0 + d.y;
            });
        })
        ]);

    var y = d3.scale.linear()
        .range([h - padding.bottom - padding.top, 0])
        .domain([d3.max(dataset, function (d) {
            return d3.max(d, function (d) {
                return d.y0 + d.y;
            });
        }), 0]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        //.tickPadding(10);
        //.ticks(10);
        .ticks(d3.time.days, 20);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(10);


    //Easy colors accessible via a 10-step ordinal scale
    //var colors = d3.scale.category10();

    //Create SVG element
    var svg = d3.select("#stackarea")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Add a group for each row of data
    var groups = svg.selectAll("g")
        .data(dataset)
        .enter()
        .append("g")
        .attr("class", "rgroups")
        .attr("transform", "translate(" + padding.left + "," + padding.bottom + ")")
        .style("fill", function (d, i) {
            return color_hash[dataset.indexOf(d)][1];
        });

    // Add a rect for each data value
    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) {
            return xScale(new Date(d.time));
        })
        .y0(function (d) {
            return ((h - padding.top - padding.bottom) - y(d.y0) - y(d.y) );
        })
        .y1(function (d) {
            return ((h - padding.top - padding.bottom) - y(d.y0));
        });

    groups.append("path")
        .attr("d", function (d) {
            return area(d);
        });


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(40," + (h - padding.bottom) + ")")
        .call(xAxis);


    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
        .call(yAxis);

    // adding legend

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("x", w - padding.right - 65)
        .attr("y", 25)
        .attr("height", 100)
        .attr("width", 100);

    legend.selectAll("g").data(dataset)
        .enter()
        .append('g')
        .each(function (d, i) {
            var g = d3.select(this);
            g.append("rect")
                .attr("x", w - padding.right - 65)
                .attr("y", i * 25 + 10)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", color_hash[String(i)][1]);

            g.append("text")
                .attr("x", w - padding.right - 50)
                .attr("y", i * 25 + 20)
                .attr("height", 30)
                .attr("width", 100)
                .style("fill", color_hash[String(i)][1])
                .text(color_hash[String(i)][0]);
        });

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 5)
        .attr("x", 0 - (h / 2))
        .attr("dy", "1em")
        .text("Number of Messages");

    svg.append("text")
        .attr("class", "xtext")
        .attr("x", w / 2 - padding.left)
        .attr("y", h - 5)
        .attr("text-anchor", "middle")
        .text("Days");
});