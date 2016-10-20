/**
 * Created by motu on 2016/10/5.
 */


    var margin = {top: 380, right: 480, bottom: 500, left: 480},
        radius = Math.min(margin.top, margin.right, margin.bottom, margin.left, 280) - 10;
//最小能写入text的弧度
    function filter_min_arc_size_text(d, i) {
        return (d.dx * d.depth * radius / 3) > 14
    };

//color setting
    var hue = d3.scale.category20();
    //var hue1 = d3.schemeCategory20b();

    var luminance = d3.scale.sqrt()
        .domain([0, 1.8e5])
        .clamp(true)
        .range([110, 20]);



    var svg = d3.select("#radialset").append("svg")
        .attr("width", margin.left + margin.right)
        .attr("height", margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//布局 转换数据
    var partition = d3.layout.partition()
        .sort(function(a, b) { return d3.ascending(a.name, b.name); })
        .size([2 * Math.PI, radius]);

    var arc = d3.svg.arc()
        .startAngle(function (d) {
            return d.x;
        })
        .endAngle(function (d) {
            return d.x + d.dx - .01 / (d.depth + .5);
        })
        .innerRadius(function (d) {
            return radius / 3 * d.depth;
        })
        .outerRadius(function (d) {
            return radius / 3 * (d.depth + 1) - 1;
        });

//Tooltip description
    var tooltip = d3.select("body")
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
        var description = d.description;
        return '<b>' + d.name + '</b></br>' + d.description + '<br> (' + format_number(d.value) + ')';
    }

//计算文字旋转角度
    function computeTextRotation(d) {
        var angle = (d.x + d.dx / 2) * 180 / Math.PI - 90;

        return angle;
    }

    function mouseOverArc(d) {
        d3.select(this).attr("stroke", "black");

        tooltip.html(format_description(d));
        return tooltip.transition()
            .duration(50)
            .style("opacity", 0.9);
    }

    function mouseOutArc() {
        d3.select(this).attr("stroke", "");
        return tooltip.style("opacity", 0);
    }

    function mouseMoveArc(d) {
        return tooltip
            .style("top", (d3.event.pageY - 10) + "px")
            .style("left", (d3.event.pageX + 10) + "px");
    }

//read json data
    var root_ = null;

//compare
    var fragrance = ["薰衣草", "自然清香", "风清白兰"];

    d3.json("flare-labeled.json", function (error, root) {
        if (error) return console.warn(error);
        // Compute the initial layout on the entire tree to sum sizes.
        // Also compute the full name and fill color for each node,
        // and stash the children so they can be restored as we descend.

        partition
            .value(function (d) {
                return d.size;
            })
            .nodes(root)
            .forEach(function (d) {
                d._children = d.children;
                d.sum = d.value;
                d.key = key(d);//路径
                d.flag = flag(d);//添加标志%%
                d.fill = fill(d);


            });

        partition.nodes(root);




        //var nodes =partition.nodes(root);
        //console.log(nodes);

        // Now redefine the value function to use the previously-computed sum.
        partition
            .children(function (d, depth) {
                return depth < 4 ? d._children : null;
            })
            .value(function (d) {
                return d.sum;
            });


        //绘制中心白色圆圈
        var center = svg.append("circle")
            .attr("r", radius / 3)
            .on("click", zoomOut);

        center.append("title")
            .text("zoom out");

        //选取数组中从1到最后的元素
        var partitioned_data = partition.nodes(root).slice(1);
        // console.log(partitioned_data);

        //绘制
        var path = svg.selectAll("path")
            .data(partitioned_data)//绑定数据
            .enter().append("path")
            .attr("d", arc)//弧生成器
            .style("fill", function (d) {
                return d.fill;
            })//填充颜色

            .each(function (d) {
                this._current = updateArc(d);
            })//??点击后更新
            .on("click", zoomIn)
            .on("mouseover", mouseOverArc)
            .on("mousemove", mouseMoveArc)
            .on("mouseout", mouseOutArc)
            .on("dblclick", zoomComp);


        var texts = svg.selectAll("text")
            .data(partitioned_data)//绑定数据
            .enter().append("text")
            .filter(filter_min_arc_size_text)//过滤 过小的部分不写入text
            .attr("transform", function (d) {
                return "rotate(" + computeTextRotation(d) + ")";
            })

            //      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("x", function (d) {
                return radius / 3 * d.depth;
            })
            .attr("dx", "15") // margin
            .attr("dy", ".35em") // vertical-align
            .text(function (d) {
                return d.name
            });


        function zoomIn(p) {

            if ((p.depth > 1) && (!p.flag)) p = p.parent;
            if (!p.children) return;
            zoom(p, p);
        }

        function zoomOut(p) {
            if (!p.parent) return;
            zoom(p.parent, p);
        }

        function zoomComp(p) {
            if (p.flag)
                window.location.href = "new.jsp";
        }

        // Zoom to the specified new root.
        function zoom(root, p) {
            if (document.documentElement.__transition__) return;

            // Rescale outside angles to match the new layout.
            var enterArc,
                exitArc,
                outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);

            function insideArc(d) {
                //console.log(d.key);
                //console.log(p.key);
                return p.key > d.key
                    ? {depth: d.depth - 1, x: 0, dx: 0} : p.key < d.key
                    ? {depth: d.depth - 1, x: 2 * Math.PI, dx: 0}
                    : {depth: 0, x: 0, dx: 2 * Math.PI};
                //return {depth: 0, x: 0, dx: 0};
            }

            function outsideArc(d) {
                //  return {depth: 0, x: 0, dx: 0};
                return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
            }


            center.datum(root);

            // When zooming in, arcs enter from the outside and exit to the inside.
            // Entering outside arcs start from the old layout.

            if ((root === p)) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);
            //&&(!p.children)
            //if ((root === p)&&(p.depth<3))
            var new_data = partition.nodes(root).slice(1);
            //console.log(new_data);
            //？？？
            path = path.data(new_data, function (d) {
                return d.key;
            })//d.key


            // When zooming out, arcs enter from the inside and exit to the outside.
            // Exiting outside arcs transition to the new layout.
            if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

            //！！！
            d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function () {
                path.exit().transition()
                    .style("fill-opacity", function (d) {
                        return d.depth === 1 + (root === p) ? 1 : 0;
                    })

                    .attrTween("d", function (d) {
                        return arcTween.call(this, exitArc(d));
                    })
                    .remove();

                path.enter().append("path")
                    .style("fill-opacity", function (d) {
                        return d.depth === 2 - (root === p) ? 1 : 0;
                    })
                    // function(d) { return d.depth === 2 - (root === p) ? 1 : 0;
                    .style("fill", function (d) {
                        return d.fill;
                    })
                    .on("click", zoomIn)
                    .on("mouseover", mouseOverArc)
                    .on("mousemove", mouseMoveArc)
                    .on("mouseout", mouseOutArc)
                    .on("dbclick", zoomComp)
                    .each(function (d) {
                        this._current = enterArc(d);
                    });


                path.transition()
                    .style("fill-opacity", 1)
                    .attrTween("d", function (d) {
                        return arcTween.call(this, updateArc(d));
                    });

            });


            texts = texts.data(new_data, function (d) {
                return d.key;
            })//d.key
            // console.log(texts.key);
            texts.exit()
                .remove();
            texts.enter()
                .append("text");

            texts.style("opacity", 0)
                .attr("transform", function (d) {
                    return "rotate(" + computeTextRotation(d) + ")";
                })
                .attr("x", function (d) {
                    return radius / 3 * d.depth;
                })
                .attr("dx", "6") // margin
                .attr("dy", ".35em") // vertical-align
                .filter(filter_min_arc_size_text)
                .text(function (d, i) {
                    return d.name
                })
                .transition().delay(750).style("opacity", 1)

        }
    });
//路径
    function key(d) {
        var k = [], p = d;
        while (p.depth) k.push(p.name), p = p.parent;
        // console.log(k.reverse().join("."));
        return k.reverse().join(".");
    }

//%%
    function flag(d) {
        var i, f = 0, p = d;
        for (i = 0; i < 3; i++) {
            if (p.name === fragrance[i]) f = 1;
            //console.log(i);
        }
        //console.log(p.name);
        //console.log(f);
        return f;
    }

    function compute(d) {
        var com = [], p = d;
        for (var i = 0; i < 4; i++) {
            if (p.name == fragrance[i]) com[i] += p.value;
        }
        ;
        return com;
    }


// color

    function fill(d) {
        var p = d;
        var c;
        while ((p.depth > 1) && (p.flag != 1))
            p = p.parent;
        c = d3.lab(hue(p.name));
        c.l = luminance(d.sum);

        return c;
    }

//？？？
    function arcTween(b) {
        var i = d3.interpolate(this._current, b);
        this._current = i(0);
        return function (t) {
            return arc(i(t));
        };
    }

    function updateArc(d) {
        return {depth: d.depth, x: d.x, dx: d.dx};
    }

    d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");

