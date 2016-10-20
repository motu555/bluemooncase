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
d3.json("mperday.json",function(json){
    dataset = json;

    //Data, stacked
    stack(dataset);
    console.log(dataset);
    var color_hash = {
        0 : ["洗衣液","#6060FF"],
        1 : ["洗手液","#8096FF"],
        2 : ["家庭清洁","#CDD2FF"]
        //3 : ["家庭清洁","#8096FF"]

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
        .range([0, w-padding.left-padding.right])
        .domain([new Date(dataset[0][0].time),d3.time.day.offset(new Date(dataset[0][dataset[0].length-1].time),2)]);
    //.domain(d3.extent(dataset, function (d) { return d.time; }));
    var yScale = d3.scale.linear()
        .range([h-padding.bottom-padding.top,0])
        .domain([0, d3.max(dataset, function(d) {
            return d3.max(d, function(d) {return d.y0 + d.y;});})
        ]);

    var y= d3.scale.linear()
        .range([h-padding.bottom-padding.top,0])
        .domain([ d3.max(dataset, function(d) {
            return d3.max(d, function(d) {return d.y0 + d.y;});}),0]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        //.tickPadding(10);
        //.ticks(10);
        .ticks(d3.time.days,20);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(10);



    //Easy colors accessible via a 10-step ordinal scale
    //var colors = d3.scale.category10();

    //Create SVG element
    var svg = d3.select("#arealine")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Add a group for each row of data
    var groups = svg.selectAll("g")
        .data(dataset)
        .enter()
        .append("g")
        .attr("class","rgroups")
        .attr("transform","translate("+ padding.left + "," + padding.bottom +")")
        .style("fill", function(d, i) {
            return color_hash[dataset.indexOf(d)][1];
        });

    // Add a rect for each data value
    /*        var rects = groups.selectAll("rect")
     .data(function(d) { return d; })
     .enter()
     .append("rect")
     .attr("width", 2)
     .style("fill-opacity",1e-6);


     rects.transition()
     .duration(function(d,i){
     return 500 * i;
     })
     .ease("linear")
     .attr("x", function(d) {
     return xScale(new Date(d.time));
     })
     .attr("y", function(d) {
     return -(- yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom)*2);
     })
     .attr("height", function(d) {
     return -yScale(d.y) + (h - padding.top - padding.bottom);
     })
     .attr("width", 15)
     .style("fill-opacity",1);*/

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x( function(d) {
            return xScale(new Date(d.time));
        })
        .y0( function(d) {
            return ((h - padding.top - padding.bottom)- y(d.y0) - y(d.y) );
        })
        .y1( function(d) {
            return ((h - padding.top - padding.bottom)-y(d.y0));});

    groups.append("path")
        .attr("d",function (d) {return area(d);});
    //.attr("width", 2)
    //.style("fill-opacity",1e-6);


    //area.transition()
    //.duration(function(d,i){return 500 * i;})
    //.ease("linear")

    //.attr("width", 15)
    //.style("fill-opacity",1);


    svg.append("g")
        .attr("class","x axis")
        .attr("transform","translate(40," + (h - padding.bottom) + ")")
        .call(xAxis);


    svg.append("g")
        .attr("class","y axis")
        .attr("transform","translate(" + padding.left + "," + padding.top + ")")
        .call(yAxis);

    // adding legend

    var legend = svg.append("g")
        .attr("class","legend")
        .attr("x", w - padding.right - 65)
        .attr("y", 25)
        .attr("height", 100)
        .attr("width",100);

    legend.selectAll("g").data(dataset)
        .enter()
        .append('g')
        .each(function(d,i){
            var g = d3.select(this);
            g.append("rect")
                .attr("x", w - padding.right - 65)
                .attr("y", i*25 + 10)
                .attr("width", 10)
                .attr("height",10)
                .style("fill",color_hash[String(i)][1]);

            g.append("text")
                .attr("x", w - padding.right - 50)
                .attr("y", i*25 + 20)
                .attr("height",30)
                .attr("width",100)
                .style("fill",color_hash[String(i)][1])
                .text(color_hash[String(i)][0]);
        });

    svg.append("text")
        .attr("transform","rotate(-90)")
        .attr("y", 0 - 5)
        .attr("x", 0-(h/2))
        .attr("dy","1em")
        .text("Number of Messages");

    svg.append("text")
        .attr("class","xtext")
        .attr("x",w/2 - padding.left)
        .attr("y",h - 5)
        .attr("text-anchor","middle")
        .text("Days");
    /*
     svg.append("text")
     .attr("class","title")
     .attr("x", (w / 2))
     .attr("y", 20)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .style("text-decoration", "underline")
     .text("Number of messages per day.");*/

    //On click, update with new data
    d3.selectAll(".m")
        .on("click", function() {
            var date = this.getAttribute("value");

            var str;
            if(date == "2014-02-19"){
                str = "19.json";
            }else if(date == "2014-02-20"){
                str = "20.json";
            }else if(date == "2014-02-21"){
                str = "21.json";
            }else if(date == "2014-02-22"){
                str = "22.json";
            }else{
                str = "23.json";
            }

            d3.json(str,function(json){

                dataset = json;
                stack(dataset);

                console.log(dataset);

                xScale.domain([new Date(0, 0, 0,dataset[0][0].time,0, 0, 0),new Date(0, 0, 0,dataset[0][dataset[0].length-1].time,0, 0, 0)])
                    .rangeRound([0, w-padding.left-padding.right]);

                yScale.domain([0,
                    d3.max(dataset, function(d) {
                        return d3.max(d, function(d) {
                            return d.y0 + d.y;
                        });
                    })
                ])
                    .range([h-padding.bottom-padding.top,0]);

                xAxis.scale(xScale)
                    .ticks(d3.time.hour,2)
                    .tickFormat(d3.time.format("%H"));

                yAxis.scale(yScale)
                    .orient("left")
                    .ticks(10);

                groups = svg.selectAll(".rgroups")
                    .data(dataset);

                groups.enter().append("g")
                    .attr("class","rgroups")
                    .attr("transform","translate("+ padding.left + "," + (h - padding.bottom) +")")
                    .style("fill",function(d,i){
                        return color(i);
                    });


                rect = groups.selectAll("rect")
                    .data(function(d){return d;});

                rect.enter()
                    .append("rect")
                    .attr("x",w)
                    .attr("width",1)
                    .style("fill-opacity",1e-6);

                rect.transition()
                    .duration(1000)
                    .ease("linear")
                    .attr("x",function(d){
                        return xScale(new Date(0, 0, 0,d.time,0, 0, 0));
                    })
                    .attr("y",function(d){
                        return -(- yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom)*2);
                    })
                    .attr("height",function(d){
                        return -yScale(d.y) + (h - padding.top - padding.bottom);
                    })
                    .attr("width",15)
                    .style("fill-opacity",1);

                rect.exit()
                    .transition()
                    .duration(1000)
                    .ease("circle")
                    .attr("x",w)
                    .remove();

                groups.exit()
                    .transition()
                    .duration(1000)
                    .ease("circle")
                    .attr("x",w)
                    .remove();


                svg.select(".x.axis")
                    .transition()
                    .duration(1000)
                    .ease("circle")
                    .call(xAxis);

                svg.select(".y.axis")
                    .transition()
                    .duration(1000)
                    .ease("circle")
                    .call(yAxis);

                svg.select(".xtext")
                    .text("Hours");

                svg.select(".title")
                    .text("Number of messages per hour on " + date + ".");
            });
        });


});
