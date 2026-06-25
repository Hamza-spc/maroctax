import { calculateNetSalary } from './net-salary.js';
import type { FiscalYear, RaiseSimulation } from './types.js';
import { roundMoney } from './utils.js';

/**
 * Compares net salary before and after a gross raise.
 * @param currentGross - Current monthly gross in MAD.
 * @param newGross - Proposed monthly gross in MAD.
 * @param dependents - Number of dependents.
 * @param year - Fiscal year (defaults to 2025).
 */
export function simulateRaise(
  currentGross: number,
  newGross: number,
  dependents = 0,
  year: FiscalYear = 2025,
): RaiseSimulation {
  const before = calculateNetSalary(currentGross, dependents, year);
  const after = calculateNetSalary(newGross, dependents, year);
  const deltaGross = roundMoney(newGross - currentGross);
  const deltaNet = roundMoney(after.net - before.net);
  const deltaIr = roundMoney(after.ir - before.ir);
  const marginalNetRate = deltaGross === 0 ? 0 : roundMoney(deltaNet / deltaGross);

  return {
    year,
    dependents,
    before,
    after,
    deltaGross,
    deltaNet,
    deltaIr,
    marginalNetRate,
  };
}
