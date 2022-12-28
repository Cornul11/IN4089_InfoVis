class WinRatePatch {
    constructor() {
        // winratePatch div name
        const margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select("#winratePatch")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        //Read the data TODO: this is just an example for formatting
        d3.csv("http://localhost:5000/api/v1/winrate_civ?civ=Franks",
            // When reading the csv, I must format variables:
            function (d) {
                return {patch: d.patch, amount: d.amount}
            }).then(
            // Now I can use this dataset:
            function (data) {
                console.log(data)  // TODO: remove
                const patches = data.map(function (d) {return parseInt(d.patch)})
                // Add X axis
                const x = d3.scalePoint()
                    .range([0, width])
                    .domain(patches)

                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));
                // Add Y axis
                const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => parseInt(d.amount))])
                    .range([height, 0]);
                svg.append("g")
                    .call(d3.axisLeft(y));
                // Add the line
                svg.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", "#69b3a2")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x(d => x(parseInt(d.patch)))
                        .y(d => y(d.amount))
                    )
                // Add the points
                svg
                    .append("g")
                    .selectAll("dot")
                    .data(data)
                    .join("circle")
                    .attr("cx", d => x(parseInt(d.patch)))
                    .attr("cy", d => y(d.amount))
                    .attr("r", 5)
                    .attr("fill", "#69b3a2")
            })
    }
}