class Heatmap {
    constructor() {
        this.margin = {top: 30, right: 30, bottom: 60, left: 65}
        this.width = 600 - this.margin.left - this.margin.right
        this.height = 600 - this.margin.top - this.margin.bottom

        // append the svg object to the body of the page
        this.svg = d3.select("#heatmap")
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Labels of row and columns
        this.civilizations = ["Aztecs", "Berbers", "Britons", "Bulgarians", "Burmese", "Byzantines", "Celts",
            "Chinese", "Cumans", "Ethiopians", "Franks", "Goths", "Huns", "Incas", "Indians", "Italians", "Japanese",
            "Khmer", "Koreans", "Lithuanians", "Magyars", "Malay", "Malians", "Mayans", "Mongols", "Persians",
            "Portuguese", "Saracens", "Slavs", "Spanish", "Tatars", "Teutons", "Turks", "Vietnamese", "Vikings"]

        //Read the data
        d3.csv("http://localhost:5000/api/v1/heatmap_civs").then(data => {
            this.updateChart(data)
        });
    }

    updateChart(data) {
        // Build X scales and axis:
        const x = d3.scaleBand()
            .range([0, this.width])
            .domain(this.civilizations)
            .padding(0.01);
        this.svg.append("g")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        // Build Y scales and axis:
        const y = d3.scaleBand()
            .range([this.height, 0])
            .domain(this.civilizations)
            .padding(0.01);
        this.svg.append("g")
            .call(d3.axisLeft(y));

        // Build color scale
        const myColor = d3.scaleLinear()
            .range(["white", "#69b3a2"])
            .domain([0.4, 0.6])

        this.svg.selectAll()
            .data(data, function (d) {
                return d.civ + ':' + d.ociv;
            })
            .join("rect")
            .attr("x", function (d) {
                return x(d.civ)
            })
            .attr("y", function (d) {
                return y(d.ociv)
            })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) {
                return myColor(parseFloat(d.val))
            })
        console.log("Heatmap Updated!")  // TODO: remove
    }
}