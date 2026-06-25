import type { FiscalConfig } from './types.js';
import { roundMoney } from './utils.js';

/**
 * Professional expenses deduction (frais professionnels).
 * 20% of (gross − CNSS − AMO), capped monthly.
 * @param grossAfterSocial - Gross minus CNSS and AMO.
 * @param config - Fiscal configuration for the payroll year.
 */
export function calculateFraisProfessionnels(
  grossAfterSocial: number,
  config: FiscalConfig,
): number {
  const uncapped = grossAfterSocial * config.fraisProfessionnelsRate;
  return roundMoney(Math.min(uncapped, config.fraisProfessionnelsMonthlyCap));
}
