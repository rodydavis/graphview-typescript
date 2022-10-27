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

import type { Node } from "./node";

/**
 * Edge represents a connection between two nodes.
 * 
 * The name is optional, but if it is not provided, the edge will be
 * assigned a name based on the source and target node names.
 */
export class Edge {
    source: Node;
    destination: Node;
    data?: { [key: string]: any };


    constructor(source: Node, destination: Node) {
        this.source = source;
        this.destination = destination;
    }

    static fromJson(nodes: Node[], data: { source: string, destination: string, name?: string, data?: { [key: string]: any }, }) {
        const sourceNode = nodes.find(n => n.id === data.source)!;
        const destinationNode = nodes.find(n => n.id === data.destination)!;
        const edge = new Edge(sourceNode, destinationNode);
        if (data.data) edge.data = data.data;
        return edge;
    }

    toJSON() {
        return {
            source: this.source.id,
            destination: this.destination.id,
            data: this.data,
        };
    }
}