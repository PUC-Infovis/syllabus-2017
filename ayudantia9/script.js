
const WIDTH = 1500;
const HEIGHT = 800;
const MARGIN = { TOP: 40, BOTTOM: 40, LEFT: 50, RIGHT: 50 };

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

const ticked = () => {
    container.selectAll('.node')
    .attr('transform', node => `translate(${node.x}, ${node.y})`);

    container.selectAll('line')
             .attr('x1', link => link.source.x)
             .attr('y1', link => link.source.y)
             .attr('x2', link => link.target.x)
             .attr('y2', link => link.target.y);
};

const simulation = d3.forceSimulation()
                     .force('center', d3.forceCenter(width/2, height/2))
                     .force('collision', d3.forceCollide(20))
                     .force('charge', d3.forceManyBody().strength(-500))
                     .force('link', d3.forceLink().id(node => node.id));

d3.json(FILEPATH, dataset => {
    simulation.nodes(dataset.nodes)
              .on('tick', ticked)
              .force('link')
              .links(dataset.links)
              .distance(80);

    container.selectAll('line')
             .data(dataset.links)
             .enter()
             .append('line')
             .attr('x1', link => link.source.x)
             .attr('y1', link => link.source.y)
             .attr('x2', link => link.target.x)
             .attr('y2', link => link.target.y);

    const nodes = container.selectAll('.node')
                           .data(dataset.nodes)
                           .enter()
                           .append('g')
                           .attr('class', 'node');

    nodes.append('circle').attr('r', 20);
    nodes.append('text').text(node => node.id).attr('dy', 5);
});
