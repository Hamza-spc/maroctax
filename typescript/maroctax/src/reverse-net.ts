import { calculateNetSalary } from './net-salary.js';
import type { FiscalYear } from './types.js';
import { roundMoney } from './utils.js';

/**
 * Finds the gross salary that produces a target net (binary search).
 * @param targetNet - Desired monthly net salary in MAD.
 * @param dependents - Number of dependents.
 * @param year - Fiscal year (defaults to 2025).
 */
export function reverseFromNet(
  targetNet: number,
  dependents = 0,
  year: FiscalYear = 2025,
): number {
  if (targetNet <= 0) {
    return 0;
  }

  let low = targetNet;
  let high = targetNet * 3;

  while (calculateNetSalary(high, dependents, year).net < targetNet) {
    high *= 2;
  }

  for (let i = 0; i < 64; i++) {
    const mid = roundMoney((low + high) / 2);
    const net = calculateNetSalary(mid, dependents, year).net;

    if (net < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
  }

  let gross = Math.ceil(high * 100) / 100;
  while (gross > 0 && calculateNetSalary(gross, dependents, year).net > targetNet) {
    gross = roundMoney(gross - 0.01);
  }
  while (calculateNetSalary(gross, dependents, year).net < targetNet) {
    gross = roundMoney(gross + 0.01);
  }

  return gross;
}
