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

import type { Graph } from "../classes/graph";
import type { Node } from "../classes/node";
import { Random } from "../utils/random";

/**
 * Base class for all algorithms.
 */
export abstract class Algorithm {
    graphHeight = 500;
    graphWidth = 500;
    random = new Random();
    focusedNode: Node | null = null;

    abstract init(graph: Graph): void;

    abstract step(graph: Graph): void;

    setDimensions(width: number, height: number) {
        this.graphWidth = width;
        this.graphHeight = height;
    }

    setFocusedNode(node: Node | null) {
        this.focusedNode = node;
    }
}