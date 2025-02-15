import { isNumber } from './number-guard';

describe('isNumber', () => {
  it('should return true for a number', () => {
    const input = 123;
    const output = isNumber(input);
    expect(output).toBe(true);
  });

  it('should return false for a string', () => {
    const input = '123';
    const output = isNumber(input);
    expect(output).toBe(false);
  });

  it('should return false for a boolean', () => {
    const input = true;
    const output = isNumber(input);
    expect(output).toBe(false);
  });
});
