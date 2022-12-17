class PieChart {
    constructor() {
        // set the dimensions and margins of the graph
        this.width = 500
        this.height = 500
        this.margin = 40

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
            .sort(d3.ascending)

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
            .attr('d', d3.arc()
                .innerRadius(0)  // This makes the donut hole, 0 is a pie chart
                .outerRadius(this.radius)
            )
            .attr('fill', function (d) {  // Hardcoded colors
                if (d.data[0] === "RM_1v1") {
                    return "#21ad45"
                }
                else if (d.data[0] === "RM_TEAM") {
                    return "#ea541c"
                }
            })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 1)

        const arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(this.radius)

        d3.select('#pie_chart').selectAll('text').remove()  // Clear the old text
        this.svg.selectAll('mySlices')
            .data(data_ready)
            .join('text')
            .text(function(d) {
	        if(d.data[0] == "RM_1v1")
		    return "1v1 Mode (" + Math.round(d.value/total*100) + "%)";
		else
		    return "Team Mode (" + Math.round(d.value/total*100) + "%)";
	    })
            .attr("transform", function(d) { return `translate(${arcGenerator.centroid(d)})`})
            .style("text-anchor", "middle")
            .style("font-size", 17)
    }
}