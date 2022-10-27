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

import { DEFAULT_NODE_SIZE } from "../utils/constants";
import { Offset } from "../utils/offset";
import { Rect } from "../utils/rect";

/**
 * Node represents a single node in the graph.
 * 
 * The name is optional, but if it is not provided, the node will be
 * assigned a name based on the id.
 * 
 * The width and height are optional, but if they are not provided, the
 * node will be assigned a default size.
 * 
 * The position describes the node's position in the graph. If it is not
 * provided, the node will be assigned a random position.
 */
export class Node {
    id: string;
    data?: { [key: string]: any };
    rect = new Rect(0, 0, DEFAULT_NODE_SIZE, DEFAULT_NODE_SIZE);

    constructor(id: string) {
        this.id = id;
    }

    static fromJson(json: any): Node {
        const node = new Node(json.id);
        if (json.data) node.data = json.data;
        const o = new Offset(json.x ?? 0, json.y ?? 0);
        const size = { width: json.width ?? DEFAULT_NODE_SIZE, height: json.height ?? DEFAULT_NODE_SIZE };
        node.rect = new Rect(o.x, o.y, size.width, size.height);
        return node;
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    get position() {
        return new Offset(this.rect.x, this.rect.y);
    }

    set position(position: Offset) {
        this.rect = new Rect(position.x, position.y, this.rect.width, this.rect.height);
    }

    get width() {
        return this.rect.width;
    }

    get height() {
        return this.rect.height;
    }

    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            data: this.data,
        };
    }
}
