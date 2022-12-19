class Heatmap {
    constructor() {
        const margin = {top: 30, right: 30, bottom: 60, left: 65},
            width = 600 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
        const svg = d3.select("#heatmap")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

// Labels of row and columns
        const civilizations = ["Aztecs", "Berbers", "Britons", "Bulgarians", "Burmese", "Byzantines", "Celts",
            "Chinese", "Cumans", "Ethiopians", "Franks", "Goths", "Huns", "Incas", "Indians", "Italians", "Japanese",
            "Khmer", "Koreans", "    Lithuanians", "Magyars", "Malay", "Malians", "Mayans", "Mongols", "Persians",
            "Portuguese", "Saracens", "Slavs", "Spanish", "Tatars", "Teutons", "Turks", "Vietnamese", "Vikings"]

// Build X scales and axis:
        const x = d3.scaleBand()
            .range([0, width])
            .domain(civilizations)
            .padding(0.01);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

// Build Y scales and axis:
        const y = d3.scaleBand()
            .range([height, 0])
            .domain(civilizations)
            .padding(0.01);
        svg.append("g")
            .call(d3.axisLeft(y));

// Build color scale
        const myColor = d3.scaleLinear()
            .range(["white", "#69b3a2"])
            .domain([0.4, 0.6])

//Read the data
        d3.csv("http://localhost:5000/api/v1/heatmap_civs").then(function (data) {
            svg.selectAll()
                .data(data, function (d) {
                    return d.civ + ':' + d.ociv;
                })
                .join("rect")
                .attr("x", function (d) {
                    return x(d.civ)
                })
                .attr("y", function (d) {
                    console.log(y(d.ociv))
                    return y(d.ociv)
                })
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function (d) {
                    return myColor(parseFloat(d.val))
                })

        })
    }
}