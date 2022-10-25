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

interface GraphJson {
    nodes: NodeJson[];
    edges: EdgeJson[];
}

interface NodeJson {
    id: string;
    name?: string;
    data?: { [key: string]: string };
}

interface EdgeJson {
    source: string;
    destination: string;
    data?: { [key: string]: string };
}

export const graphData: GraphJson = {
    nodes: [
        { id: '1', data: { name: 'Node 1', backgroundColor: '#e04141', color: '#000' } },
        { id: '2', data: { name: 'Node 2', backgroundColor: '#e09c41', color: '#000' } },
        { id: '3', data: { name: 'Node 3', backgroundColor: '#e0df41', color: '#000' } },
        { id: '4', data: { name: 'Node 4', backgroundColor: '#7be041', color: '#000' } },
        { id: '5', data: { name: 'Node 5', backgroundColor: '#41e0c9', color: '#000' } },
    ],
    edges: [
        { source: '1', destination: '2' },
        { source: '1', destination: '3' },
        { source: '2', destination: '4' },
        { source: '2', destination: '5' },
        { source: '3', destination: '4' },
        { source: '3', destination: '5' },
        { source: '5', destination: '3' },
    ],
}

export function generateGraphData(nodes: number) {
    const graphData: GraphJson = {
        nodes: [],
        edges: [],
    };
    // Generate nodes
    for (let i = 0; i < nodes; i++) {
        const [r, g, b] = [Math.random(), Math.random(), Math.random()].map((n) => Math.floor(n * 255));
        const backgroundColor = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
        const color = r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000' : '#fff';
        graphData.nodes.push({ id: `${i}`, data: { name: `Node ${i}`, backgroundColor, color } });
    }
    // Connect all nodes
    for (let i = 0; i < nodes; i++) {
        for (let j = 0; j < nodes; j++) {
            if (i !== j) {
                graphData.edges.push({ source: `${i}`, destination: `${j}` });
            }
        }
    }
    return graphData;
}