const WIDTH = 900;
const HEIGHT = 600;

const FILEPATH = 'dataset.json';

const treeSVG =
  d3.select('#container')
  .select('#tree')
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .append("g").attr("transform", "translate(80,0)");

const clusterSVG =
  d3.select('#container')
  .select('#cluster')
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .append("g").attr("transform", "translate(80,0)");

const partitionSVG =
  d3.select('#container')
  .select('#partition')
  .attr('width', WIDTH)
  .attr('height', HEIGHT);

const treemapSVG =
  d3.select('#container')
  .select('#treemap')
  .attr('width', WIDTH)
  .attr('height', HEIGHT);

const packSVG =
  d3.select('#container')
  .select('#pack')
  .attr('width', WIDTH)
  .attr('height', HEIGHT);

const parentColor = d3.scaleOrdinal(d3.schemeSet3)
  .domain(['Grupo 1', 'Grupo 2', 'Grupo 3', 'Grupo 4',
    'Grupo 5', 'Grupo 6', 'Grupo 7', 'Grupo 8',
    'Grupo 9', 'Grupo 10', 'Ayudantes', 'Profesor'
  ]);
const depthColor =
  d3.scaleSequential(d3.interpolateCool)
  .domain([-2, 4]);


d3.json(FILEPATH, dataset => {

  const root = d3.hierarchy(dataset);

  // console.log(root);
  // console.log(root.data);
  // console.log(root.children[0].data);
  // console.log(root.children[1].data);

  //    Tree    /////////////////////////////////////////////////////////////////////

  const tree = d3.tree().size([HEIGHT, WIDTH - 160]);
  const treeCopy = d3.hierarchy(dataset);
  tree(treeCopy);
  console.log(treeCopy);

  let link = treeSVG.selectAll(".link")
    .data(treeCopy.links())
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

  let node = treeSVG.selectAll(".node")
    .data(treeCopy.descendants())
    .enter().append("g")
    .attr("class", d => `node${d.children ? " node--internal" : " node--leaf"}`)
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle").attr("r", 2.5);

  node.append("text")
    .attr("dy", 3)
    .attr("x", d => d.children ? -8 : 8)
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name);

  //    Cluster    /////////////////////////////////////////////////////////////////////

  const cluster = d3.cluster().size([HEIGHT, WIDTH - 160]);
  const clusterCopy = d3.hierarchy(dataset);
  cluster(clusterCopy);

  link = clusterSVG.selectAll(".link")
    .data(clusterCopy.descendants().slice(1))
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d => {
      return `M${d.y},${d.x}C${(d.parent.y + 100)},${d.x}` +
        ` ${(d.parent.y + 100)},${d.parent.x} ${d.parent.y},${d.parent.x}`;
    });

  node = clusterSVG.selectAll(".node")
    .data(clusterCopy.descendants())
    .enter().append("g")
    .attr("class", d => `node${d.children ? " node--internal" : " node--leaf"}`)
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle").attr("r", 2.5);

  node.append("text")
    .attr("dy", 3)
    .attr("x", d => d.children ? -8 : 8)
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name);

  //    Partition    /////////////////////////////////////////////////////////////////////

  const partition = d3.partition()
    .size([HEIGHT, WIDTH])
    .padding(2)
    .round(true);

  const partitionCopy = d3.hierarchy(dataset).sum(d => d.value);

  partition(partitionCopy);

  let cell = partitionSVG
    .selectAll(".node")
    .data(partitionCopy.descendants())
    .enter().append("g")
    .attr("class", d => `node${d.children ? " node--internal" : " node--leaf"}`)
    .attr("transform", d => `translate(${d.y0},${d.x0})`);

  cell.append("rect")
    .attr("width", d => d.y1 - d.y0)
    .attr("height", d => d.x1 - d.x0)
    .style("fill", d => !d.children ? parentColor(d.parent.data.name) : "#eee");

  cell.append("text")
    .attr("x", 4)
    .attr("y", 10)
    .text(d => `${d.data.name}: ${d.value}`);

  cell.append("title")
    .text(d => `${d.data.name}:\n${d.value}`);

  //    Treemap    /////////////////////////////////////////////////////////////////////

  const treemap = d3.treemap()
    .size([WIDTH, HEIGHT])
    .padding(10)
    .round(true);

  const treemapCopy = d3.hierarchy(dataset)
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(treemapCopy);

  cell = treemapSVG.selectAll("g")
    .data(treemapCopy
      .descendants()
      .filter(n => !["Grupos", "InfoVis"].includes(n.data.name))
    )
    .enter().append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  cell.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => parentColor(d.children ? d.data.name : d.parent.data.name))
    .attr("fill-opacity", d => d.children? 0.6: 1)
    .attr("stroke-width", 0);

  cell.append("text")
    .attr("x", 3)
    .attr("y", 23)
    .text(d => d.children? "" : d.data.name);

  cell.append("title")
    .text(d => `${d.data.name}\n${d.value}`);

  //    Pack    /////////////////////////////////////////////////////////////////////

  const pack = d3.pack()
    .size([WIDTH, HEIGHT])
    .padding(10);

  const packCopy = d3.hierarchy(dataset)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  pack(packCopy);

  node = packSVG
    .selectAll("g")
    .data(packCopy.descendants())
    .enter().append("g")
    .attr('transform', d => `translate(${d.x},${d.y})`)
    .attr("class", d => `node${!d.children ? " node--leaf" : d.depth ? "" : " node--root"}`);

  node.append("circle")
    .attr("r", d => d.r)
    .style("fill", d => depthColor(d.depth));

  const leaf = node.filter(d => !d.children);

  leaf.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 5)
    .text(d => d.data.name);

  node.append("title")
    .text(d => `${d.data.name}\n${d.value}`);
});