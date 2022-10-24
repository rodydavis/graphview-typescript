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

import { CLUSTER_PADDING } from "../utils/constants";
import type { Node } from "./node";
import { Offset } from "../utils/offset";
import { Rect } from "../utils/rect";

/**
 * A cluster is a collection of nodes and edges.
 */
export class NodeCluster {
    nodes: Node[] = [];
    rect: Rect = Rect.zero;

    getNodes(): Node[] {
        return this.nodes;
    }

    getRect(): Rect {
        return this.rect;
    }

    setRect(rect: Rect) {
        this.rect = rect;
    }

    add(node: Node) {
        this.nodes.push(node);

        if (this.nodes.length === 1) {
            this.rect = Rect.fromLTRB(node.x, node.y, node.x + node.width, node.y + node.height);
        } else {
            this.rect = Rect.fromLTRB(
                Math.min(this.rect.left, node.x),
                Math.min(this.rect.top, node.y),
                Math.max(this.rect.right, node.x + node.width),
                Math.max(this.rect.bottom, node.y + node.height)
            );
        }
    }

    contains(node: Node): boolean {
        return this.nodes.indexOf(node) !== -1;
    }

    size(): number {
        return this.nodes.length;
    }

    concat(cluster: NodeCluster) {
        cluster.nodes.forEach((node) => {
            node.position = new Offset(this.rect.right + CLUSTER_PADDING, this.rect.top);
            this.add(node);
        });
    }

    offset(xDiff: number, yDiff: number) {
        this.nodes.forEach((node) => {
            node.position = node.position.add(new Offset(xDiff, yDiff));
        });

        this.rect = this.rect.translate(xDiff, yDiff);
    }
}