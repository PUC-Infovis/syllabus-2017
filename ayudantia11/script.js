const WIDTH = 900;
const HEIGHT = 800;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };

const width = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
const height = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

const container = d3.select('#container')
                    .append('svg')
                      .attr('width', WIDTH)
                      .attr('height', HEIGHT)
                    .append('g')
                      .attr('transform',
                            `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

const path = d3.geoPath();
let centered = null;

const clicked = d => {
    let x, y, k;

    // zoom-in.
    if (centered !== d) {
      [x, y] = path.centroid(d);
      k = 3;
      centered = d;
    // zoom-out.
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }

    container.selectAll('path')
             .classed('active', d => d === centered);

    container.transition()
             .duration(1250)
             .attr('transform',
                   `translate(${width / 2}, ${height / 2})
                    scale(${k})
                    translate(${-x}, ${-y})`);
}

d3.json('https://d3js.org/us-10m.v1.json', (error, us) => {
    if (error) throw error;

    d3.tsv('states-names.tsv', states => {
        const names = Object.assign(...states.map(s =>
            ({ [s.id.padStart(2, '0')]: `${s.name} (${s.code})` })
        ));

        container.append('g')
                 .attr('class', 'states')
                 .selectAll('path')
                 .data(topojson.feature(us, us.objects.states).features)
                 .enter()
               .append('path')
                 .attr('d', path)
                 .on('click', clicked)
               .append('title')
                 .text(state => names[state.id]);

        container.append('path')
                 .attr('class', 'state-borders')
                 .attr('d', path(topojson.mesh(us, us.objects.states,
                     (a, b) => a !== b)));

        // container.append('path')
        //          .attr('class', 'county-borders')
        //          .attr('d', path(topojson.mesh(us, us.objects.counties,
        //              (a, b) => a !== b)));
    });
});
