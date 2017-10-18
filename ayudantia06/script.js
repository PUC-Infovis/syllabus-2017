
const WIDTH = 720;
const HEIGHT = 680;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };
const PADDING = 30;
const MAX_RADIUS = 40;

const width = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
const height = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

const FILEPATH = 'dataset.csv';

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

d3.csv(FILEPATH, dataset => {
    const xscale = d3.scaleLinear()
                     .domain([0, d3.max(dataset, d => parseInt(d.ns1))])
                     .range([PADDING, width - PADDING]);

    const yscale = d3.scaleLinear()
                     .domain([0, d3.max(dataset, d => parseInt(d.ns2))])
                     .range([height - PADDING, PADDING]);

    const rscale = d3.scalePow().exponent(0.5)
                     .domain([0, d3.max(dataset, d => parseInt(d.gscholar))])
                     .range([0, MAX_RADIUS]);

     const axisBottom = d3.axisBottom(xscale).tickPadding(10);
     const axisLeft = d3.axisLeft(yscale).tickPadding(10);

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

    // Segunda alternativa de escala
    // =============================
    const ageToColor2 = d3.scaleLinear()
                         .domain(d3.extent(dataset, d => parseInt(d.age)))
                         .range(['#FFF', '#F44336']);

    container.selectAll('circle')
             .data(dataset)
             .enter()
             .append('circle')
               .attr('cx', d => xscale(d.ns1))
               .attr('cy', d => yscale(d.ns2))
               .attr('r', d => rscale(d.gscholar))
            //    .attr('fill', d => ageToColor(d.age))
               .attr('fill', d => ageToColor2(d.age))
               .on('mouseover', function(d, i, e) {
                   d3.select(this)
                     .style('stroke', '#333')
                     .style('stroke-width', '5px');

                   d3.selectAll(e)
                     .filter(':not(:hover)')
                     .style('fill-opacity', 0.5);
               })
               .on('mouseout', function(d, i, e) {
                   d3.select(this)
                     .style('stroke-width', '0px');

                   d3.selectAll(e)
                     .style('fill-opacity', 1);
                 })
                .append('title')
                .text(d => `${d.firstname} ${d.lastname} (${d.gscholar})`);

    container.call(axisLeft)
             .append('g')
             .attr('transform', `translate(0, ${height})`)
             .call(axisBottom);
    });
