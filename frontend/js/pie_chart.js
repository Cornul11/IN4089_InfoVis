class PieChart {
    constructor() {
        // set the dimensions and margins of the graph
        this.width = 500
        this.height = 500
        this.margin = 40
        this.selectedTeams = false;
        this.selected1v1 = false;

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        this.radius = Math.min(this.width, this.height) / 2 - this.margin;

        this.svg = d3.select("#pie_chart")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

        d3.json("http://localhost:5000/api/v1/game_type_stats").then(data => {
            this.updateChart(data);
        });
    }

    updateChart(data) {
        // Compute the position of each group on the pie:
        const pie = d3.pie()
            .value(function (d) {
                return d[1];  // Amount of games in type
            })

        const arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(this.radius);
        const arcOver = d3.arc().innerRadius(0).outerRadius(this.radius + 10);

        const data_ready = pie(Object.entries(data))
        let total = 0;
        if (data["RM_1v1"])
            total += data["RM_1v1"];
        if (data["RM_TEAM"])
            total += data["RM_TEAM"];
        // map to data
        this.svg.selectAll("path")
            .data(data_ready)
            // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
            .join('path')
            .attr('d', function(d) {
                    return arcGenerator(d);
                }
            )
            .attr('fill', function (d) {  // Hardcoded colors
                if (d.data[0] === "RM_1v1") {
                    return "#21ad45"
                } else if (d.data[0] === "RM_TEAM") {
                    return "#ea541c"
                }
            })
            .on("click", function(d, i)
            {
                if (i.data[0] === "RM_1v1")
                {
                    if(this.selected1v1)
                    {
                        this.selected1v1 = false;
                        d3.select(this)
                            .transition()
                            .duration(1000)
                            .attr("d", arcGenerator)
                    } else {
                        this.selected1v1 = true;
                        d3.select(this)
                            .attr("stroke", "white")
                            .transition()
                            .duration(1000)
                            .attr("d", arcOver)
                            .attr("stroke-width", "6px");
                    }
                    console.log("1v1 filtering goes here");
                }

                if (i.data[0] === "RM_TEAM")
                {
                    if(this.selectedTeams)
                    {
                        this.selectedTeams = false;
                        d3.select(this)
                            .transition()
                            .duration(1000)
                            .attr("d", arcGenerator)
                    } else {
                        this.selectedTeams = true;
                        d3.select(this)
                            .attr("stroke", "white")
                            .transition()
                            .duration(1000)
                            .attr("d", arcOver)
                            .attr("stroke-width", "6px");
                    }
                    console.log("team filtering goes here");
                }
            })
            .on("mouseenter", function(d, i){
                console.log(i.data[0])
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '.85');
            })
            .on("mouseleave", function(d){
                // d3.select(this)
                //     .transition()
                //     .duration(1000)
                //     .attr("d", arcGenerator)
            })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 1)

        d3.select('#pie_chart').selectAll('text').remove()  // Clear the old text
        this.svg.selectAll('mySlices')
            .data(data_ready)
            .join('text')
            .text(function (d) {
                if (d.data[0] === "RM_1v1")
                    return "1v1 Mode (" + Math.round(d.value / total * 100) + "%)";
                else
                    return "Team Mode (" + Math.round(d.value / total * 100) + "%)";
            })
            .attr("transform", function (d) {
                return `translate(${arcGenerator.centroid(d)})`
            })
            .style("text-anchor", "middle")
            .style("font-size", 17)
    }
}