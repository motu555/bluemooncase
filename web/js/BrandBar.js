var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 570 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var svgb = d3.select("#BrandBar").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x0 = d3.scale.ordinal()
    .rangeBands([0, height], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
    .range([0,width-60]);

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);



var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("left");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("top")
    .tickFormat(d3.format(".2s"));

//tooltips
var tooltips = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("opacity", 0);

//数字格式
function format_number(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//描述格式
function format_description(d) {
    return '<b>' + d.name + '</b>' + '<br>'+' (' + format_number(d.value) + ')';
}

function mouseOverArc(d) {
    d3.select(this).attr("stroke", "black");

    tooltips.html(format_description(d));
    return tooltips.transition()
        .duration(50)
        .style("opacity", 0.9);
}

function mouseOutArc() {
    d3.select(this).attr("stroke", "");
    return tooltips.style("opacity", 0);
}

function mouseMoveArc(d) {
    return tooltips
        .style("top", (d3.event.pageY - 10) + "px")
        .style("left", (d3.event.pageX + 10) + "px");
}


d3.csv("data.csv", function(error, data) {
    if (error) throw error;
    //console.log(data);
    var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "State"; });

    data.forEach(function(d) {
        d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
        //console.log(d.ages);
    });

    x0.domain(data.map(function(d) { return d.State; }));
    x1.domain(ageNames)
        .rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

    svgb.append("g")
        .attr("class", "yaxis")
        //.attr("transform", "translate(0," + height + ")")
        .call(yAxis)
        .append("text")
        .attr("dx" , "-.5em")
        .style("text-anchor", "end")
        .text("Sales");

    svgb.append("g")
        .attr("class", "xaxis")
        .call(xAxis);

    var state = svgb.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "state")
        .attr("transform", function(d) { return "translate(0," + x0(d.State) + ")"; });

    state.selectAll("rect")
        .data(function(d) { return d.ages; })
        .enter().append("rect")
        .attr("height", x1.rangeBand())
        .attr("y", function(d) { return x1(d.name); })
        //.attr("y", function(d) { return y(d.value); })
        .attr("width", function(d) { return y(d.value); })
        .style("fill", function(d) { return color(d.name); })
        .on("mouseover", mouseOverArc)
        .on("mousemove", mouseMoveArc)
        .on("mouseout", mouseOutArc);
    //图例
    var legend = svgb.selectAll(".legend")
        .data(ageNames.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

});
//change
var menu = d3.select("#menu select")
    .on("change", change);

function change() {
    d3.transition()
        .duration( 1500)
        .each(redraw);
    //console.log("rerawing");
}

function redraw() {
    var series = menu.property("value");
    var str;
    if (series == "A") {

        str = "a.csv";
    } else if (series == "B") {

        str = "b.csv";
    }


    d3.csv(str, function (error, data) {
        if (error) throw error;
        //console.log(data);
        var ageName = d3.keys(data[0]).filter(function(key) { return key !== "State"; });
        console.log(ageName);
        data.forEach(function(d) {
            d.ages = ageName.map(function(name) { return {name: name, value: +d[name]}; });
            //console.log(d.ages);
        });



        x0.domain(data.map(function(d) { //console.log(d.State);
            return d.State; }));
        x1.domain(ageName)
            .rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

        xAxis.scale(x0)
            .orient("left");

        yAxis.scale(y)
            .orient("top");
        //.tickFormat(d3.format(".2s"));

        svgb.select(".xaxis")
            .transition()
            .duration(1000)
            .ease("circle")
            .call(xAxis);

        svgb.select(".yaxis")
            .transition()
            .duration(1000)
            .ease("circle")
            .call(yAxis);

        var statenew = svgb.selectAll(".state")
            .data(data);

        statenew.enter().append("g")
            .attr("class", "state");
        statenew.exit()
            .transition().duration(1000).ease("circle")
            .remove();

        statenew.attr("transform", function(d,i) { return "translate(0," + x0(d.State) + ")"; });

        var rect  = statenew.selectAll("rect")
            .data(function(d) {return d.ages; });

        rect.enter().append("rect")
            .attr("x",0)
            .attr("width",1)
            .style("fill-opacity",1e-6);

        rect.exit()
            .transition().duration(1000).ease("circle")
            .attr("x",width)
            .remove();//

        rect.transition()
            .duration(1000)
            .ease("linear")
            .attr("height", x1.rangeBand())
            .attr("y", function(d) { return x1(d.name); })
            .attr("width", function(d) { return y(d.value); })
            .style("fill", function(d) { return color(d.name); })
            .style("fill-opacity",1);
        /*      .on("mouseover", mouseOverArc)
         .on("mousemove", mouseMoveArc)
         .on("mouseout", mouseOutArc);*/



        //



    });
}
