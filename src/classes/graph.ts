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

import { Edge } from "./edge";
import { Node } from "./node";

/**
 * A graph is a collection of nodes and edges.
 */
export class Graph {
    constructor(public nodes: Node[], public edges: Edge[]) { }

    static fromJson(data: {
        nodes: { id: string }[],
        edges: { source: string, destination: string }[],
    }) {
        const nodes = data.nodes.map(Node.fromJson);
        const edges = data.edges.map(e => Edge.fromJson(nodes, e));
        return new Graph(nodes, edges);
    }

    toJson() {
        return {
            nodes: this.nodes.map(n => n.toJSON()),
            edges: this.edges.map(e =>e.toJSON()),
        };
    };

    successorsOf(node: Node): Node[] {
        return this.getOutEdges(node).map(e => e.destination);
    }

    getOutEdges(node: Node): Edge[] {
        return this.edges.filter(e => e.source === node);
    }

    predecessorsOf(node: Node): Node[] {
        return this.getInEdges(node).map(e => e.source);
    }

    getInEdges(node: Node): Edge[] {
        return this.edges.filter(e => e.destination === node);
    }

    getEdgeBetween(source: Node, destination: Node): Edge | undefined {
        return this.edges.find(e => e.source === source && e.destination === destination);
    }

    hasNodes() {
        return this.nodes.length > 0;
    }

    getNode(id: string): Node | undefined {
        return this.nodes.find(n => n.id === id);
    }
}