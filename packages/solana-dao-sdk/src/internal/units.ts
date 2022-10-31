import { BigNumber } from 'bignumber.js';

const SECONDS_PER_DAY = 86400;

export function getTimestampFromDays(days: number) {
  return days * SECONDS_PER_DAY;
}

// Converts amount in decimals to mint amount (natural units)
export function getMintNaturalAmountFromDecimal(
  decimalAmount: number,
  decimals: number,
) {
  return new BigNumber(decimalAmount).shiftedBy(decimals).toNumber();
}
