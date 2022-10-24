import { expect, it, describe } from 'vitest'
import { Random } from './random';

describe('random tests', () => {
    it('next double generates random number', () => {
        const random = new Random();

        const result = random.nextDouble();

        expect(result).to.be.a('number');
        expect(result).to.be.greaterThan(0);
        expect(result).to.be.lessThan(1);
    });
});