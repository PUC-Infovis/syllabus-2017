
const WIDTH = 900;
const HEIGHT = 800;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };

const width = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
const height = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

const chartHeight = height / 2 - 20;

const container = d3.select('#container')
                    .append('svg')
                      .attr('width', WIDTH)
                      .attr('height', HEIGHT)
                    .append('g')
                      .attr('transform',
                            `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

container.append('g').attr('id', 'height');
container.append('g').attr('id', 'weight')
                     .attr('transform', `translate(0, ${chartHeight + 50})`);

const HEIGHT_MU    = 165;
const WEIGHT_MU    =  70;
const HEIGHT_SIGMA =  20;
const WEIGHT_SIGMA =  15;

const heightDist = d3.randomNormal(HEIGHT_MU, HEIGHT_SIGMA);
const weightDist = d3.randomNormal(WEIGHT_MU, WEIGHT_SIGMA);

const data = d3.range(1000).map(() => ({
    height: heightDist(),
    weight: weightDist(),
}));

console.log(data);

const renderHistogram = (data, mu, sigma, container) => {

    const x = d3.scaleLinear()
                .domain([mu - 2 * sigma,
                         mu + 2 * sigma])
                .range([0, width]);

    const histogram = d3.histogram()
                        .domain(x.domain())
                        .thresholds(16);

    const bins = histogram(data);
    const binWidth = x(bins[0].x1) - x(bins[0].x0);

    const y = d3.scaleLinear()
                .domain([0, d3.max(bins, d => d.length)])
                .range([chartHeight, 0]);

    // Ahora, a visualizar...
    const chart = d3.select(`#${container}`);
    const bars = chart.selectAll(".bar").data(bins)
                      .enter()
                     .append("g")
                       .attr("class", "bar")
                       .attr("transform", d =>
                             `translate(${x(d.x0)}, ${y(d.length)})`);

    bars.append("rect")
          .attr("x", 1)
          .attr("width", binWidth - 2)
          .attr("height", d => chartHeight - y(d.length));

    bars.append("text")
          .attr("dy", d => chartHeight - y(d.length) > 20 ? "1em" : "-1em")
          .attr("fill", d => chartHeight - y(d.length)> 20 ? "#FAFAFA" : "#5C6BC0")
          .attr("x", binWidth / 2)
          .attr("y", 6)
          .attr("text-anchor", "middle")
          .text(d => d.length);

    chart.append("g")
           .attr("class", "axis axis--x")
           .attr("transform", `translate(0, ${chartHeight})`)
           .call(d3.axisBottom(x).ticks(16));

    return { data, chart, x, y };
};

const hdata = data.map(d => d.height);
const wdata = data.map(d => d.weight);
// const [hdata, wdata] = ['height', 'width'].map(p => data.map(d => d[p]));

const hhistogram = renderHistogram(hdata, HEIGHT_MU, HEIGHT_SIGMA, 'height');
const whistogram = renderHistogram(wdata, WEIGHT_MU, WEIGHT_SIGMA, 'weight');

const brushed = (datum, index, nodes) => {
    if (d3.event.sourceEvent.type === "brush") return;
    const pleaseFloorToFive = x => Math.floor(x / 5) * 5;

    const hx = hhistogram.x;
    const wx = whistogram.x;
    const wy = whistogram.y;

    const boundaries = d3.event.selection.map(hx.invert);
    const [s0, s1] = boundaries.map(pleaseFloorToFive);

    const filtered = data.filter(
        d => d.height >= s0 && d.height < s1).map(d => d.weight);

    const bins = d3.histogram()
                   .domain(wx.domain())
                   .thresholds(16)(filtered);

    const t = d3.transition().duration(100).ease(d3.easeLinear);

    d3.select('#weight')
      .selectAll("g.bar")
      .data(bins)
      .transition(t)
      .attr("transform", d =>
            `translate(${wx(d.x0)}, ${wy(d.length)})`);

    d3.select('#weight')
      .selectAll("rect")
      .data(bins)
      .transition(t)
      .attr("height", d => chartHeight - wy(d.length));

    d3.select('#weight').selectAll("text").data(bins)
      .attr("dy", d => chartHeight - wy(d.length) > 20 ? "1em" : "-1em")
      .attr("fill", d => chartHeight - wy(d.length)> 20 ? "#FAFAFA" : "#5C6BC0")
      .text(d => d.length);

    d3.select(nodes[index]).call(d3.event.target.move, [s0, s1].map(hx));
};

const brush = d3.brushX()
                .extent([[0, 0], [width, chartHeight]])
                .on("brush", brushed);

hhistogram.chart.append("g").attr("class", "brush").call(brush);
