import type { FiscalConfig } from './types.js';
import { roundMoney } from './utils.js';

/**
 * Annual gross income tax from progressive barème.
 * @param netTaxableAnnual - Annual net taxable income in MAD.
 * @param config - Fiscal configuration for the payroll year.
 */
export function calculateIrAnnual(
  netTaxableAnnual: number,
  config: FiscalConfig,
): number {
  const taxable = Math.max(0, netTaxableAnnual);

  for (const bracket of config.irBrackets) {
    if (taxable <= bracket.upTo) {
      return roundMoney(Math.max(0, taxable * bracket.rate - bracket.deduction));
    }
  }

  return 0;
}

/**
 * Monthly income tax withheld from salary.
 * @param netTaxableMonthly - Monthly net taxable income in MAD.
 * @param config - Fiscal configuration for the payroll year.
 */
export function calculateIrMonthly(
  netTaxableMonthly: number,
  config: FiscalConfig,
): number {
  const annual = calculateIrAnnual(netTaxableMonthly * 12, config);
  return roundMoney(annual / 12);
}
