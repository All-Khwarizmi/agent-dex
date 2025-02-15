export function formatNumber(value: unknown): number {
  const number = Number(value);
  if (isNaN(number)) {
    throw new Error('Invalid number' + ' ' + value);
  }
  return number;
}
