import * as d3 from "https://cdn.skypack.dev/d3@7";

const dataset = async function getData() {
    return await d3.csv("data/Portuguese.csv");
}

async function drawChart() {
    const data = await dataset();
    console.log(data);
    const svgWidth = 500;
    const svgHeight = 500;

    let svg = d3.select("svg");

    svg
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    let radius = Math.min(svgWidth, svgHeight) / 2,
        g = svg.append("g").attr("transform", "translate(" + svgWidth / 2 + ", " + svgWidth / 2 + ")");

    let color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);

    let pie = d3.pie();

    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    let arcs = g.selectAll("arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("fill", function (d) {
            console.log(d);
            return color(d.data.school);
        })
        .attr("d", arc);
}

drawChart();
