class EloMatch {
    constructor(updateAllCharts) {
        const margin = {top: 30, right: 30, bottom: 70, left: 60},
            width = 800 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        const svg = d3.select("#eloPerMatch")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                `translate(${margin.left},${margin.top})`);

        d3.json("http://localhost:5000/api/v1/match_elos").then(data => {
            const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.range)])
                .range([0, width]);

            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x));

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.frequency)]).range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(y));

            // mouseover capabilities
            const tooltip = d3.select("#eloPerMatch")
                .append("div")
                .style("opacity", 0)
                .style("display", "inline")
                .style("position", "fixed")
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "4px")
                .style("padding", "10px")

            const mouseover = function (event, d) {
                tooltip.html("" + d.frequency)
                    .style("opacity", 1)
            }

            const mousemove = function (event, d) {
                tooltip.style("cursor", "pointer")
                    .style("left", (event.x) + "px")
                    .style("top", (event.y - 44.75) + "px")  // TODO: Don't know how to get the tooltip height
            }

            const mouseleave = function (event, d) {
                tooltip.style("opacity", 0)
            }

            // brush to select interval starts here
            const brush = d3.brushX()
                .extent([[1, 0.5], [width, height - 1]])
                .on("brush", brushed)
                .on("end", brushFinished);

            const gb = svg.append("g")
                .call(brush);

            function brushed({selection}) {

            }

            function brushFinished({selection}) {
                if (!selection) {
                    console.log("cleared");
                    updateAllCharts(null, null);
                } else {
                    const selection_x = [parseInt(x.invert(selection[0])), parseInt(x.invert(selection[1]))];
                    updateAllCharts(selection_x[0], selection_x[1]);
                }
            }

            // end of brush
            // create graph
            svg.selectAll(".histogram")
                .data(data)
                .enter()
                .append("rect")
                .on("mouseover", mouseover)
                .on("mouseleave", mouseleave)
                .attr("x", function (d) {
                    return x(d.range - 57)
                })
                .attr("width", width / 59)
                .attr("y", function (d) {
                    return y(d.frequency)
                })
                .attr("height", function (d) {
                    return height - y(d.frequency)
                })
                .attr("fill", "#69b3a2")
                .on("mousemove", mousemove)
        });
    }
}