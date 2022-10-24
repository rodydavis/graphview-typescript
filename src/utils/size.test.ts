import { expect, it, describe } from 'vitest'
import type { Size } from './size';

describe('size tests', () => {
    it('width and height return correctly', () => {
        const size: Size = { width: 10, height: 20 };

        expect(size.width).to.be.equal(10);
        expect(size.height).to.be.equal(20);
    });
});