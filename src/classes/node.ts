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
    name?: string;
    position: Offset = Offset.zero;
    width: number = DEFAULT_NODE_SIZE;
    height: number = DEFAULT_NODE_SIZE;

    constructor(id: string) {
        this.id = id;
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }
}
