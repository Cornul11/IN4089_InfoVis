class WinRatePatch {
    constructor() {
        // winratePatch div name
        const margin = {top: 10, right: 30, bottom: 30, left: 60}
        this.width = 460 - margin.left - margin.right
        this.height = 400 - margin.top - margin.bottom

        // append the svg object to the body of the page
        this.svg = d3.select("#winratePatch")
            .append("svg")
            .attr("width", this.width + margin.left + margin.right)
            .attr("height", this.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        //Read the data TODO: currently holds Aztecs until I figure out what to do when there's no civ selected
        d3.csv("http://localhost:5000/api/v1/winrate_civ?civ=Aztecs").then(data => {
            this.updateChart(data)
        });
    }

    updateChart(data) {
        this.svg.selectAll("*").remove();
        const patches = data.map(function (d) {
            return parseInt(d.patch)
        })
        // Add X axis
        const x = d3.scalePoint()
            .range([0, this.width])
            .domain(patches)

        this.svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(x));
        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => parseInt(d.amount))])
            .range([this.height, 0]);
        this.svg.append("g")
            .call(d3.axisLeft(y));
        // Add the line
        this.svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(parseInt(d.patch)))
                .y(d => y(d.amount))
            )
        // Add the points
        this.svg.append("g")
            .selectAll("dot")
            .data(data)
            .join("circle")
            .attr("cx", d => x(parseInt(d.patch)))
            .attr("cy", d => y(d.amount))
            .attr("r", 5)
            .attr("fill", "#69b3a2")
    }
}