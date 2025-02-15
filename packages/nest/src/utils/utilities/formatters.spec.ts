import { fromBigIntToNumber } from './formatters';

describe('fromBigIntToNumber', () => {
  it('should convert a bigint to a number', () => {
    const input = BigInt(1234567890);
    const output = fromBigIntToNumber(input);
    expect(output).toBe(1234567890);
  });
});
