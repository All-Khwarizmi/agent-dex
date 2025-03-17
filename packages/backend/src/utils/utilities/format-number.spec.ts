import { formatNumber } from './format-number';

describe('formatNumber', () => {
  it('should throw an error for invalid input', () => {
    const input = 'abc';
    expect(() => formatNumber(input)).toThrow('Invalid number' + ' ' + input);
  });
  it('should return a number for valid input', () => {
    const input = 123;
    const output = formatNumber(input);
    expect(output).toBe(123);
  });

  it('should return a number for a string input', () => {
    const input = '123';
    const output = formatNumber(input);
    expect(output).toBe(123);
  });

  it('should return a number for a boolean input', () => {
    const input = true;
    const output = formatNumber(input);
    expect(output).toBe(1);
  });
});
