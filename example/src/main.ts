import './style.css'
import { ForceDirectedGraph, Graph } from 'graphview-typescript';

const graphData = {
  nodes: [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ],
  edges: [
    { source: '1', destination: '2' },
    { source: '1', destination: '3' },
    { source: '2', destination: '4' },
    { source: '2', destination: '5' },
    { source: '3', destination: '4' },
    { source: '3', destination: '5' },
  ],
}

const graph = Graph.fromJson(graphData);
const algorithm = new ForceDirectedGraph();
const output = document.getElementById('output') ?? document.body;

algorithm.layout(graph);
algorithm.init(graph);

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('width', '100%');
svg.setAttribute('height', '100%');
svg.setAttribute('viewBox', `0 0 ${algorithm.graphWidth} ${algorithm.graphHeight}`);
svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

for (const edge of graph.edges) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', edge.source.x.toString());
  line.setAttribute('y1', edge.source.y.toString());
  line.setAttribute('x2', edge.destination.x.toString());
  line.setAttribute('y2', edge.destination.y.toString());
  line.setAttribute('stroke', 'black');
  line.setAttribute('data-source', edge.source.id);
  line.setAttribute('data-destination', edge.destination.id);
  svg.appendChild(line);
}

for (const node of graph.nodes) {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', node.x.toString());
  circle.setAttribute('cy', node.y.toString());
  circle.setAttribute('r', '10');
  circle.setAttribute('fill', 'grey');
  circle.setAttribute('data-id', node.id);
  svg.appendChild(circle);

  // Node Label
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  text.textContent = node.name ?? node.id;
  circle.appendChild(text);
}

output.appendChild(svg);

const tickMs = 25;
let tick = 0;
setInterval(() => {
  algorithm.step(graph);
  graph.nodes.forEach((node) => {
    const element = document.querySelector(`circle[data-id="${node.id}"]`);
    if (element) {
      element.setAttribute('cx', node.x.toString());
      element.setAttribute('cy', node.y.toString());
    }
  });
  graph.edges.forEach((edge) => {
    const element = document.querySelector(`line[data-source="${edge.source.id}"][data-destination="${edge.destination.id}"]`);
    if (element) {
      element.setAttribute('x1', edge.source.x.toString());
      element.setAttribute('y1', edge.source.y.toString());
      element.setAttribute('x2', edge.destination.x.toString());
      element.setAttribute('y2', edge.destination.y.toString());
    }
  });
  tick++;
}, tickMs);
