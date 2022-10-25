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

/**
 * An offset is a 2D vector that describes a position with x and y coordinates.
 * 
 * These helper methods come from the Offset class in the Dart SDK.
 */
export class Offset {
    constructor(readonly x: number, readonly y: number) { }
    static zero = new Offset(0, 0);

    add(offset: Offset): Offset {
        return new Offset(this.x + offset.x, this.y + offset.y);
    }

    subtract(offset: Offset): Offset {
        return new Offset(this.x - offset.x, this.y - offset.y);
    }

    divide(divisor: number): Offset {
        return new Offset(this.x / divisor, this.y / divisor);
    }


    public get distance(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }


    limit(max: number): Offset {
        const distance = this.distance;
        if (distance > max) {
            return this.divide(distance).multiply(max);
        }
        return this;
    }

    multiply(multiplier: number): Offset {
        return new Offset(this.x * multiplier, this.y * multiplier);
    }

    normalize(): Offset {
        return this.divide(this.distance);
    }

    rotate(angle: number): Offset {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Offset(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
}
