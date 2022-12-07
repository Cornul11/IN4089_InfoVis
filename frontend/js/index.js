async function drawEloMatch() {

    // set the dimensions and margins of the graph
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 600 - margin.left - margin.right,
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
            .call(d3.axisBottom(x))
        ;
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.frequency)]).range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.range) })
                .y(function(d) { return y(d.frequency) })
            )
        // append the bar rectangles to the svg element
    //     svg.data(data)
    //         .enter()
    //         .append("rect")
    //         .attr("x", 1)
    //         .attr("transform", function (d) {
    //             return `translate(${x(d.range)} , ${y(d.frequency)})`
    //         })
    //         .attr("width", function (d) {
    //             return x(d.frequency) - x(d.range) - 1
    //         })
    //         .attr("height", function (d) {
    //             return height - y(d.frequency);
    //         })
    //         .style("fill", "#69b3a2")
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
            .attr("fill", "#69b3a2")
    })
}

drawEloMatch();
drawChart();
