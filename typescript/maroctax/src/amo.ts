import type { FiscalConfig } from './types.js';
import { roundMoney } from './utils.js';

/**
 * Employee AMO contribution (2.26% of full gross, no cap).
 * @param gross - Monthly gross salary in MAD.
 * @param config - Fiscal configuration for the payroll year.
 */
export function calculateAmo(gross: number, config: FiscalConfig): number {
  return roundMoney(gross * config.amoEmployeeRate);
}
