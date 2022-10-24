import { expect, it, describe } from 'vitest'
import { Offset } from './offset';

describe('offset tests', () => {
    it('empty offset returns no values', () => {
        const offset = Offset.zero;

        const translated = offset.add(new Offset(10, 10));

        expect(offset.x).to.be.equal(0);
        expect(offset.y).to.be.equal(0);
        expect(translated.x).to.be.equal(10);
        expect(translated.y).to.be.equal(10);
    });

    it('offset returns no values', () => {
        const offset = new Offset(10, 10);

        const translated = offset.add(new Offset(10, 10));

        expect(offset.x).to.be.equal(10);
        expect(offset.y).to.be.equal(10);
        expect(translated.x).to.be.equal(20);
        expect(translated.y).to.be.equal(20);
    });
});