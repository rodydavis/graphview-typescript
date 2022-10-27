import { ForceDirectedGraph, Graph, Offset } from 'graphview-typescript';
import { generateGraphData } from './example';

const graph = Graph.fromJson(generateGraphData(20));
const algorithm = new ForceDirectedGraph();

onmessage = (event) => {
    if (event.data.type === 'init') {
        const { width, height } = event.data;
        algorithm.setDimensions(width, height);
        algorithm.init(graph);
        postMessage({
            type: 'init',
            width: algorithm.graphWidth,
            height: algorithm.graphHeight,
            graph: graph.toJson(),
        });
        startTick();
    }
    if (event.data.type === 'stop') {
        stopTick();
    }
    if (event.data.type === 'move') {
        const { x, y, id } = event.data;
        const node = graph.getNode(id);
        if (node) {
            node.position = node.position.add(new Offset(x, y));
            algorithm.copyPositions(graph);
        }
    }
};

let handle: number | undefined;
const tickMs = graph.nodes.length < 100 ? 10 : 100;
function startTick() {
    handle = setInterval(() => {
        algorithm.step(graph);
        algorithm.positionNodes(graph);
        postMessage({
            type: 'tick',
            graph: graph.toJson(),
        });
    }, tickMs) as unknown as number;
}

function stopTick() {
    clearInterval(handle);
}