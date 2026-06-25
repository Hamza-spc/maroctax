import type { FiscalConfig } from './types.js';
import { roundMoney } from './utils.js';

/**
 * Employee CNSS contribution (4.48% of gross, capped monthly).
 * @param gross - Monthly gross salary in MAD.
 * @param config - Fiscal configuration for the payroll year.
 */
export function calculateCnss(gross: number, config: FiscalConfig): number {
  const base = Math.min(gross, config.cnssEmployeeCap);
  return roundMoney(base * config.cnssEmployeeRate);
}
