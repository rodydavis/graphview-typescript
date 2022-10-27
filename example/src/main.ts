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

import './style.css'
import { Edge, Graph, Offset, Node } from 'graphview-typescript';
import Worker from './worker?worker';

const worker = new Worker();
const output = document.getElementById('output') ?? document.body;
const rect = output.getBoundingClientRect();
let graph: Graph;
const activeColor = 'black';
let focusedNode: Node | null = null;

worker.onmessage = (event) => {
  console.log(event.data);
  if (event.data.graph) {
    graph = Graph.fromJson(event.data.graph);

    if (event.data.type === 'init') {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const { width, height } = event.data;
      svg.setAttribute('width', width.toString());
      svg.setAttribute('height', height.toString());
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.setAttribute('style', 'overflow: visible');

      // Defs
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.appendChild(defs);

      const arrowStart = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      arrowStart.setAttribute('id', 'arrowstart');
      arrowStart.setAttribute('viewBox', '0 0 13 10');
      arrowStart.setAttribute('refX', '2');
      arrowStart.setAttribute('refY', '5');
      arrowStart.setAttribute('markerWidth', '3.5');
      arrowStart.setAttribute('markerHeight', '3.5');
      arrowStart.setAttribute('orient', 'auto');
      arrowStart.setAttribute('fill', 'grey');
      const arrowStartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrowStartPath.setAttribute('d', 'M 13 0  C 13 0, 10 5, 13 10   L 13 10  L 0 5');
      arrowStart.appendChild(arrowStartPath);
      defs.appendChild(arrowStart);

      const arrowStartInbound = arrowStart.cloneNode(true) as SVGMarkerElement;
      arrowStartInbound.setAttribute('id', 'arrowstartactive');
      arrowStartInbound.setAttribute('fill', activeColor);
      defs.appendChild(arrowStartInbound);

      const arrowEnd = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      arrowEnd.setAttribute('id', 'arrowend');
      arrowEnd.setAttribute('viewBox', '0 0 13 10');
      arrowEnd.setAttribute('refX', '11');
      arrowEnd.setAttribute('refY', '5');
      arrowEnd.setAttribute('markerWidth', '3.5');
      arrowEnd.setAttribute('markerHeight', '3.5');
      arrowEnd.setAttribute('orient', 'auto');
      arrowEnd.setAttribute('fill', 'grey');
      const arrowEndPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrowEndPath.setAttribute('d', 'M 0 0  C 0 0, 3 5, 0 10   L 0 10  L 13 5');
      arrowEnd.appendChild(arrowEndPath);
      defs.appendChild(arrowEnd);

      const arrowEndInbound = arrowEnd.cloneNode(true) as SVGMarkerElement;
      arrowEndInbound.setAttribute('id', 'arrowendactive');
      arrowEndInbound.setAttribute('fill', activeColor);
      defs.appendChild(arrowEndInbound);

      // Create Edges
      let skippedEdges: Edge[] = [];
      for (const edge of graph.edges) {
        const isSkipped = skippedEdges.some(e => {
          const mSource = e.source.id === edge.source.id;
          const mDestination = e.destination.id === edge.destination.id;
          if (mSource && mDestination) return true;
          const rSource = e.source.id === edge.destination.id;
          const rDestination = e.destination.id === edge.source.id;
          if (rSource && rDestination) return true;
          return false;
        });
        if (isSkipped) continue;
        // Check for reverse
        const reverse = graph.edges.find(e => e.source === edge.destination && e.destination === edge.source);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('data-source', edge.source.id);
        line.setAttribute('data-destination', edge.destination.id);
        const { start, end } = edgePath(edge);
        line.setAttribute('x1', start.x.toString());
        line.setAttribute('y1', start.y.toString());
        line.setAttribute('x2', end.x.toString());
        line.setAttribute('y2', end.y.toString());
        line.setAttribute('fill', 'lightgray');
        line.setAttribute('stroke', 'lightgray');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#arrowend)');
        if (reverse) {
          line.setAttribute('marker-start', 'url(#arrowstart)');
          line.setAttribute('data-reverse', 'true');
          skippedEdges.push(edge);
        }
        svg.appendChild(line);

        // Edge Label
        if (edge.data?.name) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'title');
          text.textContent = edge.data.name;
          line.appendChild(text);
        }
      }

      // Create Nodes
      for (const node of graph.nodes) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('data-id', node.id);
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

        // Properties
        const bgColor = node.data?.backgroundColor;
        const textColor = node.data?.color;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', node.width.toString());
        circle.setAttribute('fill', bgColor ?? 'grey');
        circle.setAttribute('stroke', 'black');
        g.appendChild(circle);

        // Node Label
        if (node.data?.name) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.textContent = node.data.name;
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('alignment-baseline', 'middle');
          text.setAttribute('fill', textColor ?? 'black');
          text.setAttribute('font-size', '8px');
          g.appendChild(text);
        }

        // Set pointer capture to allow dragging outside of the SVG element
        g.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          g.setPointerCapture(e.pointerId);

          const pointermove = (e: PointerEvent) => {
            const delta = new Offset(e.movementX, e.movementY);
            worker.postMessage({ type: 'move', id: node.id, x: delta.x, y: delta.y });
          }

          const pointerup = () => {
            window.removeEventListener('pointermove', pointermove);
            window.removeEventListener('pointerup', pointerup);
            g.releasePointerCapture(e.pointerId);
          }

          window.addEventListener('pointermove', pointermove);
          window.addEventListener('pointerup', pointerup);

          focusedNode = node;
        });

        svg.appendChild(g);
      }

      // Remove focus on double click
      svg.addEventListener('dblclick', () => {
        focusedNode = null;
      });

      output.appendChild(svg);
    }

    graph.nodes.forEach((node) => {
      const element = document.querySelector(`g[data-id="${node.id}"]`);
      if (element) {
        element.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      }
    });
    graph.edges.forEach((edge) => {
      let element: Element | null = null;
      const reverse = graph.edges.find(e => e.source === edge.destination && e.destination === edge.source);
      if (reverse) {
        element = document.querySelector(`line[data-source="${edge.destination.id}"][data-destination="${edge.source.id}"]`);
      } else {
        element = document.querySelector(`line[data-source="${edge.source.id}"][data-destination="${edge.destination.id}"]`);
      }
      if (element) {
        const { start, end } = edgePath(edge);
        element.setAttribute('x1', start.x.toString());
        element.setAttribute('y1', start.y.toString());
        element.setAttribute('x2', end.x.toString());
        element.setAttribute('y2', end.y.toString());
      }

      if (focusedNode) {
        const isFocused = focusedNode.id === edge.source.id || focusedNode.id === edge.destination.id;
        if (isFocused) {
          element?.setAttribute('stroke', activeColor);
          element?.setAttribute('fill', activeColor);

          if (element?.hasAttribute('marker-start')) {
            element?.setAttribute('marker-start', 'url(#arrowstartactive)');
          }
          if (element?.hasAttribute('marker-end')) {
            element?.setAttribute('marker-end', 'url(#arrowendactive)');
          }
        } else {
          element?.setAttribute('stroke', 'lightgray');
          element?.setAttribute('fill', 'lightgray');

          if (element?.hasAttribute('marker-start')) {
            element?.setAttribute('marker-start', 'url(#arrowend)');
          }
          if (element?.hasAttribute('marker-end')) {
            element?.setAttribute('marker-end', 'url(#arrowend)');
          }
        }
      }

    });
  }
};

worker.postMessage({
  type: 'init',
  width: rect.width,
  height: rect.height,
});

/**
 * Returns the points on the edge of the node (instead of the center)
 */
function edgePath(edge: Edge) {
  const source = edge.source;
  const destination = edge.destination;
  // const padding = 10;

  let startX = source.x;
  let startY = source.y;
  let endX = destination.x;
  let endY = destination.y;

  // Get the offset on the radius of the circle
  const angle = Math.atan2(endY - startY, endX - startX);
  startX += Math.cos(angle) * source.width;
  startY += Math.sin(angle) * source.height;
  endX -= Math.cos(angle) * destination.width;
  endY -= Math.sin(angle) * destination.height;

  return {
    start: new Offset(startX, startY),
    end: new Offset(endX, endY),
  }
}
