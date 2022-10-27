/*
 Copyright 2016 Google Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

import { DEFAULT_ITERATIONS, REPULSION_RATE, ATTRACTION_RATE, REPULSION_PERCENTAGE, ATTRACTION_PERCENTAGE, EPSILON, CLUSTER_PADDING } from "../utils/constants";
import type { Edge } from "../classes/edge";
import type { Graph } from "../classes/graph";
import type { Node } from "../classes/node";
import type { Size } from "../utils/size";
import { NodeCluster } from "../classes/node-cluster";
import { Offset } from "../utils/offset";
import { Algorithm } from "./base";

/**
 * Fruchterman Reingold Algorithm
 * 
 * This is an implementation of the Fruchterman Reingold algorithm for graph
 * layout. It is based on the description of the algorithm in the paper
 * "Graph Drawing by Force-directed Placement" by Thomas M. J. Fruchterman
 * and Edward M. Reingold.
 * 
 * The algorithm is a simulation of a physical model of a graph. The simulation
 * is run for a fixed number of iterations. Each iteration consists of two
 * phases. In the first phase, each node is moved to a new position based on
 * the attractive and repulsive forces between nodes. In the second phase, the
 * positions of the nodes are adjusted to minimize the amount of edge crossing.
 * 
 * The algorithm is designed to be run multiple times. Each time it is run,
 * the graph is laid out in a different way. The results of the algorithm are
 * not deterministic. The algorithm is designed to be run multiple times and
 * the results of the best run are used.
 * 
 * This is just a layout algorithm. It does not perform rendering. It is up to
 * the caller to render the graph.
 */
export class ForceDirectedGraph extends Algorithm {
    displacement = new Map<Node, Offset>();
    tick = 0;
    iterations = DEFAULT_ITERATIONS;
    repulsionRate = REPULSION_RATE;
    attractionRate = ATTRACTION_RATE;
    repulsionPercentage = REPULSION_PERCENTAGE;
    attractionPercentage = ATTRACTION_PERCENTAGE;

    setProperties(options: { [key: string]: any }) {
        if (options?.iterations) this.iterations = options.iterations;
        if (options?.repulsionRate) this.repulsionRate = options.repulsionRate;
        if (options?.attractionRate) this.attractionRate = options.attractionRate;
        if (options?.repulsionPercentage) this.repulsionPercentage = options.repulsionPercentage;
        if (options?.attractionPercentage) this.attractionPercentage = options.attractionPercentage;
    }

    init(graph: Graph) {
        graph.nodes.forEach((node) => {
            this.displacement.set(node, Offset.zero);
            const x = this.random.nextDouble() * this.graphWidth;
            const y = this.random.nextDouble() * this.graphHeight;
            node.position = new Offset(x, y);
        });
    }

    copyPositions(graph: Graph) {
        graph.nodes.forEach((node) => {
            this.displacement.set(node, node.position);
        });
    }

    moveNodes(graph: Graph) {
        graph.nodes.forEach((node) => {
            const newPosition = node.position.add(this.displacement.get(node)!);
            const newDX = Math.min(this.graphWidth - 40, Math.max(0, newPosition.x));
            const newDY = Math.min(this.graphHeight - 40, Math.max(0, newPosition.y));
            node.position = new Offset(newDX, newDY);
        });
    }

    cool(currentIteration: number) {
        this.tick *= 1 - currentIteration / this.iterations;
    }

    limitMaximumDisplacement(nodes: Node[]) {
        nodes.forEach((node) => {
            if (node !== this.focusedNode) {
                debugger;
                const target = this.displacement.get(node)!;
                const dist = target.distance;
                const displacementLength = Math.max(EPSILON, dist);
                const displacementAmount = displacementLength * Math.min(displacementLength, this.tick);
                const delta = target.divide(displacementAmount);
                node.position = node.position.add(delta);
            } else {
                this.displacement.set(node, Offset.zero);
            }
        });
    }

    calculateAttraction(edges: Edge[]) {
        edges.forEach((edge) => {
            const source = edge.source;
            const destination = edge.destination;
            const delta = source.position.subtract(destination.position);
            const deltaDistance = Math.max(EPSILON, delta.distance);
            const maxAttractionDistance = Math.min(this.graphWidth * this.attractionPercentage, this.graphHeight * this.attractionPercentage);
            const attractionForce = Math.min(0, Math.abs(maxAttractionDistance - deltaDistance) / (maxAttractionDistance * 2));
            const attractionVector = delta.multiply(attractionForce * this.attractionRate);

            this.displacement.set(source, this.displacement.get(source)!.subtract(attractionVector));
            this.displacement.set(destination, this.displacement.get(destination)!.add(attractionVector));
        });
    }

    calculateRepulsion(nodes: Node[]) {
        nodes.forEach((nodeA) => {
            nodes.forEach((nodeB) => {
                if (nodeA !== nodeB) {
                    const delta = nodeA.position.subtract(nodeB.position);
                    const deltaDistance = Math.max(EPSILON, delta.distance); // Protect for 0
                    const maxRepulsionDistance = Math.min(this.graphWidth * this.repulsionPercentage, this.graphHeight * this.repulsionPercentage);
                    const repulsionForce = Math.max(0, maxRepulsionDistance - deltaDistance) / maxRepulsionDistance; // Value between 0 and 1
                    const repulsionVector = delta.multiply(repulsionForce * this.repulsionRate);

                    this.displacement.set(nodeA, this.displacement.get(nodeA)!.add(repulsionVector));
                }
            });

            nodes.forEach((nodeA) => {
                this.displacement.set(nodeA, this.displacement.get(nodeA)!.divide(nodes.length));
            });
        });
    }

    layout(graph: Graph) {
        const size = this.findBiggestSize(graph) * graph.nodes.length;
        this.graphWidth = size;
        this.graphHeight = size;
    }

    run(graph: Graph, shiftX: number, shiftY: number): Size {
        this.layout(graph);

        const nodes = graph.nodes;
        const edges = graph.edges;

        this.tick = 0.1 * Math.sqrt(this.graphWidth / 2 * this.graphHeight / 2);

        this.init(graph);

        for (let i = 0; i < this.iterations; i++) {
            this.calculateRepulsion(nodes);
            this.calculateAttraction(edges);
            this.limitMaximumDisplacement(nodes);

            this.cool(i);

            if (this.done()) {
                break;
            }
        }

        if (this.focusedNode === null) {
            this.positionNodes(graph);
        }

        this.shiftCoordinates(graph, shiftX, shiftY);

        return this.calculateGraphSize(graph);
    }

    step(graph: Graph) {
        this.displacement.clear();
        graph.nodes.forEach((node) => {
            this.displacement.set(node, Offset.zero);
        });
        this.calculateRepulsion(graph.nodes);
        this.calculateAttraction(graph.edges);
        this.moveNodes(graph);
    }

    shiftCoordinates(graph: Graph, shiftX: number, shiftY: number) {
        graph.nodes.forEach((node) => {
            node.position = node.position.add(new Offset(shiftX, shiftY));
        });
    }

    positionNodes(graph: Graph) {
        const offset = this.getOffset(graph);
        const x = offset.x;
        const y = offset.y;
        const nodesVisited: Node[] = [];
        const nodeClusters: NodeCluster[] = [];
        graph.nodes.forEach((node) => {
            node.position = node.position.subtract(new Offset(x, y));
        });

        graph.nodes.forEach((node) => {
            if (!nodesVisited.includes(node)) {
                nodesVisited.push(node);
                let cluster = this.findClusterOf(nodeClusters, node);
                if (cluster === null) {
                    cluster = new NodeCluster();
                    cluster.add(node);
                    nodeClusters.push(cluster);
                }

                this.followEdges(graph, cluster, node, nodesVisited);
            }
        });

        this.positionCluster(nodeClusters);
    }

    positionCluster(nodeClusters: NodeCluster[]) {
        this.combineSingleNodeCluster(nodeClusters);

        let cluster = nodeClusters[0];
        // Move first cluster to 0,0
        cluster.offset(-cluster.rect.left, -cluster.rect.top);

        for (let i = 1; i < nodeClusters.length; i++) {
            const nextCluster = nodeClusters[i];
            const xDiff = nextCluster.rect.left - cluster.rect.right - CLUSTER_PADDING;
            const yDiff = nextCluster.rect.top - cluster.rect.top;
            nextCluster.offset(-xDiff, -yDiff);
            cluster = nextCluster;
        }
    }

    combineSingleNodeCluster(nodeClusters: NodeCluster[]) {
        let firstSingleNodeCluster: NodeCluster | null = null;

        nodeClusters.forEach((cluster) => {
            if (cluster.size() === 1) {
                if (firstSingleNodeCluster === null) {
                    firstSingleNodeCluster = cluster;
                } else {
                    firstSingleNodeCluster.concat(cluster);
                }
            }
        });

        nodeClusters.forEach((cluster) => {
            if (cluster.size() === 1) {
                nodeClusters.splice(nodeClusters.indexOf(cluster), 1);
            }
        });
    }

    followEdges(graph: Graph, cluster: NodeCluster, node: Node, nodesVisited: Node[]) {
        graph.successorsOf(node).forEach((successor) => {
            if (!nodesVisited.includes(successor)) {
                nodesVisited.push(successor);
                cluster.add(successor);

                this.followEdges(graph, cluster, successor, nodesVisited);
            }
        });

        graph.predecessorsOf(node).forEach((predecessor) => {
            if (!nodesVisited.includes(predecessor)) {
                nodesVisited.push(predecessor);
                cluster.add(predecessor);

                this.followEdges(graph, cluster, predecessor, nodesVisited);
            }
        });
    }

    findClusterOf(clusters: NodeCluster[], node: Node): NodeCluster | null {
        for (const cluster of clusters) {
            if (cluster.contains(node)) {
                return cluster;
            }
        }

        return null;
    }

    findBiggestSize(graph: Graph): number {
        return graph.nodes.map(it => Math.max(it.height, it.width)).reduce((a, b) => Math.max(a, b), 0);
    }

    getOffset(graph: Graph): Offset {
        let offsetX = Infinity;
        let offsetY = Infinity;

        graph.nodes.forEach((node) => {
            offsetX = Math.min(offsetX, node.position.x);
            offsetY = Math.min(offsetY, node.position.y);
        });

        return new Offset(offsetX, offsetY);
    }

    done(): boolean {
        return this.tick < 1 / Math.max(this.graphWidth, this.graphHeight);
    }

    calculateGraphSize(graph: Graph): Size {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        graph.nodes.forEach((node) => {
            left = Math.min(left, node.position.x);
            top = Math.min(top, node.position.y);
            right = Math.max(right, node.position.x + node.width);
            bottom = Math.max(bottom, node.position.y + node.height);
        });

        return { width: right - left, height: bottom - top };
    }
}
