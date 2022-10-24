import { expect, it, describe } from 'vitest'
import { Rect } from './rect';

describe('rect tests', () => {
    it('empty rect returns no values', () => {
        const rect = Rect.zero;

        const translated = rect.translate(10, 10);

        expect(rect.top).to.be.equal(0);
        expect(rect.left).to.be.equal(0);
        expect(rect.right).to.be.equal(0);
        expect(rect.bottom).to.be.equal(0);
        expect(translated.top).to.be.equal(10);
        expect(translated.left).to.be.equal(10);
    });

    it('rect returns no values', () => {
        const rect = Rect.fromLTRB(10, 10, 20, 20);

        const translated = rect.translate(10, 10);

        expect(rect.top).to.be.equal(10);
        expect(rect.left).to.be.equal(10);
        expect(rect.right).to.be.equal(20);
        expect(rect.bottom).to.be.equal(20);
        expect(translated.top).to.be.equal(20);
        expect(translated.left).to.be.equal(20);
    });
});