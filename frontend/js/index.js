const debug = false

async function drawEloMatch() {

    // set the dimensions and margins of the graph
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
            if (selection) {
                console.log("selected");
            }
        }

        function brushFinished({selection}) {
            if (!selection) {
                console.log("cleared");
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

        if (debug) {
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d) {
                        return x(d.range)
                    })
                    .y(function (d) {
                        return y(d.frequency)
                    })
                )
        }
    });
}

async function pieChart() {
    // set the dimensions and margins of the graph
    const width = 500,
        height = 500,
        margin = 40;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select("#pie_chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    d3.json("http://localhost:5000/api/v1/game_type_stats").then(data => {
        // set the color scale
        const color = d3.scaleOrdinal()
            .domain(["TEAM", "1V1"])
            .range(d3.schemeDark2);

        // Compute the position of each group on the pie:
        const pie = d3.pie()
            .value(function (d) {
                return d[1];  // Amount of games in type
            })
            .sort(function (a, b) {
                return d3.ascending(a.key, b.key);
            }) // This make sure that group order remains the same in the pie chart

        const data_ready = pie(Object.entries(data))

        // map to data
        svg.selectAll("path")
            .data(data_ready)
            // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
            .join('path')
            .attr('d', d3.arc()
                .innerRadius(0)  // This makes the donut hole, 0 is a pie chart
                .outerRadius(radius)
            )
            .attr('fill', function (d) {
                return (color(d.data[0]))  // Uses the "color" function created above
            })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 1)
    });
}

async function drawChart() {
    // set the dimensions and margins of the graph
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse the Data
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv").then(function (data) {

        // X axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.Country))
            .padding(0.2);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, 13000])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.Country))
            .attr("y", d => y(d.Value))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.Value))
            .attr("fill", "#69b3a2");
    })
}

drawEloMatch();
pieChart()
drawChart();
