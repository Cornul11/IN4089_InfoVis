// TODO: some of the logic is the same in every plot, it might be simplified later to reduce code
async function updateAllCharts(elo_start, elo_end) {
    updatePieChart(elo_start, elo_end)
    updateHeatmap(elo_start, elo_end)
}

async function updatePieChart(elo_start, elo_end) {
    // api call goes here
    let api_call = "http://localhost:5000/api/v1/game_type_stats";

    let params = {};
    if (elo_start != null && elo_end != null) {
        params["elo_s"] = elo_start;
        params["elo_e"] = elo_end;
    }
    if (civ.toLowerCase() !== "none") {
        params["civ"] = capitalizeFirstLetter(civ.toLowerCase());
    }
    if (map.toLowerCase() !== "none") {
        params["map"] = map.toLowerCase();
    }

    // Append the query parameters to the API call url
    if (Object.keys(params).length > 0) {
        api_call += "?" + new URLSearchParams(params).toString();
    }

    d3.json(api_call).then(data => {
        pie_chart.updateChart(data)
    });
}

async function updateHeatmap(elo_start, elo_end) {
    // api call goes here
    let api_call = "http://localhost:5000/api/v1/heatmap_civs";
    if (elo_start != null && elo_end != null) {
        api_call += `?elo_s=${elo_start}&elo_e=${elo_end}`;
    }
    // d3.csv(api_call).then(data => {
    //     heatmap.updateChart(data)
    // });
}

// Kept for reference
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

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


function create_histogram_url() {
    // Set the base API call url
    const base_url = "http://localhost:5000/api/v1/match_elos";

    // Set the query parameters based on the provided input
    let params = {};
    if (civ.toLowerCase() !== "none") {
        params["civ"] = civ;
    }
    if (map.toLowerCase() !== "none") {
        params["map"] = map;
    }

    // Append the query parameters to the API call url
    let url = base_url;
    if (Object.keys(params).length > 0) {
        url += "?" + new URLSearchParams(params).toString();
    }

    return url;
}

let civ = "none";
let map = "none";

// Update the civilization image and redraw the histogram when the dropdown menu selection changes
$("#civ-names").change(function () {
    // Update the image source and the global `civ` variable
    const civ_val = $(this).val();
    $("#civ-img").attr("src", `static/img/civ/${civ_val}.png`);
    civ = capitalizeFirstLetter(civ_val);

    // Redraw the histogram and update the card text
    match.redraw_histogram(create_histogram_url());
    $("#civ-card-text").text($("#civ-names option:selected").text());
});

// Update the map image and redraw the histogram when the dropdown menu selection changes
$("#map-names").change(function () {
    // Update the image source and the global `map` variable
    const map_val = $(this).val();
    $("#map-img").attr("src", `static/img/map/${map_val}.png`);
    map = map_val;

    // Redraw the histogram and update the card text
    match.redraw_histogram(create_histogram_url());
    $("#map-card-text").text($("#map-names option:selected").text());
});

let match = new EloMatch(updateAllCharts)
let pie_chart = new PieChart()
// let heatmap = new Heatmap()
let winrate = new WinRatePatch()
//pieChart()
drawChart();
