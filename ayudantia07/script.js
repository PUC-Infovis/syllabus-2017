
const WIDTH = 720;
const HEIGHT = 680;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };
const PADDING = 30;
const MAX_RADIUS = 40;

const width = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
const height = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

const FILEPATH = 'dataset.json';

const container = d3.select('#container')
                    .append('svg')
                      .attr('width', WIDTH)
                      .attr('height', HEIGHT)
                    .append('g')
                      .attr('transform',
                            `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

container.append('rect')
           .attr('width', width)
           .attr('height', height)
           .attr('fill', '#07B');

// Primera alternativa de escala
// =============================
const ageToColor = age => {
   if (age < 35) {
       return '#00C853';
   } else if (age < 45) {
       return '#FF4081';
   } else if (age < 55) {
       return '#2979FF';
   } else {
       return '#FFD600';
   }
};

const xscale = d3.scaleLinear().range([PADDING, width - PADDING]);
const yscale = d3.scaleLinear().range([height - PADDING, PADDING]);
const rscale = d3.scalePow().exponent(0.5).range([0, MAX_RADIUS]);

const axisBottom = d3.axisBottom(xscale).tickPadding(10);
const axisLeft = d3.axisLeft(yscale).tickPadding(10);

const xAxis = container
                .append('g')
                .attr('transform', `translate(0, ${height})`);

const yAxis = container.append('g');

// Segunda alternativa de escala
// =============================
const ageToColor2 = d3.scaleLinear().range(['#FFF', '#F44336']);

const render = dataset => {

    xscale.domain([0, d3.max(dataset, d => d.ns1)]);
    yscale.domain([0, d3.max(dataset, d => d.ns2)]);
    rscale.domain([0, d3.max(dataset, d => d.gscholar)]);

    xAxis.transition().duration(2000).call(axisBottom);
    yAxis.transition().duration(2000).call(axisLeft);

    ageToColor2.domain(d3.extent(dataset, d => d.age));

    const updatingCircles = container.selectAll('circle')
        .data(dataset, d => `${d.firstname} ${d.lastname}`);

    const enteringCircles = updatingCircles.enter()
             .append('circle')
               .attr('cx', d => xscale(d.ns1))
               .attr('cy', d => yscale(d.ns2))
            //    .attr('fill', d => ageToColor(d.age))
               .attr('fill', d => ageToColor2(d.age));

    updatingCircles.merge(enteringCircles).transition()
           .duration(2000)
           .attr('r', d => rscale(d.gscholar))
           .attr('cx', d => xscale(d.ns1))
           .attr('cy', d => yscale(d.ns2));

    enteringCircles.on('mouseover', (d, i, nodes) => {
        d3.select(nodes[i])
          .style('stroke', '#333')
          .style('stroke-width', '5px');

        d3.selectAll('circle')
          .filter(':not(:hover)')
          .style('fill-opacity', 0.5);
    })
    .on('mouseout', (d, i, nodes) => {
        d3.select(nodes[i])
          .style('stroke-width', '0px');

        d3.selectAll('circle')
          .style('fill-opacity', 1);
      })
     .append('title')
     .text(d => `${d.firstname} ${d.lastname} (${d.gscholar})`);

     updatingCircles.exit()
        .transition()
        .duration(2000)
        .attr('r', 0)
        .remove();
};

let dataset = undefined;
const getValue = phase => +d3.select(`#${phase}-input`).property('value');

d3.select('#go-button').on('click', () => {
    const [enter, update, exit] = ['enter', 'update', 'exit'].map(getValue);

    fetchData(dataset, {enter, update, exit}).get(newDataset => {
        dataset = newDataset;
        console.log(dataset);
        render(dataset)
    });
});
