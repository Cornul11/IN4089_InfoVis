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
            .sort(d3.descending)

        const data_ready = pie(Object.entries(data))

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
    }
}