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

import type { Size } from './size';
import { Offset } from './offset';

/**
 * Rect represents a rectangle.
 * 
 * These helper methods come from the Rect class in the Dart SDK.
 */
export class Rect {
    constructor(readonly x: number, readonly y: number, readonly width: number, readonly height: number) { }

    static fromLTRB(left: number, top: number, right: number, bottom: number): Rect {
        return new Rect(left, top, right - left, bottom - top);
    }

    static fromSize(size: Size): Rect {
        return new Rect(0, 0, size.width, size.height);
    }

    static fromPoints(a: Offset, b: Offset): Rect {
        return Rect.fromLTRB(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.max(a.x, b.x), Math.max(a.y, b.y),);
    }

    static zero = new Rect(0, 0, 0, 0);

    get left(): number {
        return this.x;
    }

    get top(): number {
        return this.y;
    }

    get right(): number {
        return this.x + this.width;
    }

    get bottom(): number {
        return this.y + this.height;
    }

    get size(): Size {
        return { width: this.width, height: this.height };
    }

    moveTo(x: number, y: number): Rect {
        return new Rect(x, y, this.width, this.height);
    }

    translate(x: number, y: number): Rect {
        return this.moveTo(this.x + x, this.y + y);
    }

    get center(): Offset {
        return new Offset(this.x + this.width / 2, this.y + this.height / 2);
    }
}