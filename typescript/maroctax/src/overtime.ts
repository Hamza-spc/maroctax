import { getFiscalConfig } from './fiscal-config.js';
import type { FiscalYear, OvertimeType } from './types.js';
import { roundMoney } from './utils.js';

/**
 * Calculates overtime pay for a given hourly rate, hours, and type.
 * @param hourlyRate - Base hourly rate in MAD.
 * @param hours - Number of overtime hours worked.
 * @param type - Overtime category: day (25%), night (50%), or holiday (100%) premium.
 * @param year - Fiscal year (defaults to 2025).
 */
export function calculateOvertime(
  hourlyRate: number,
  hours: number,
  type: OvertimeType,
  year: FiscalYear = 2025,
): number {
  const multiplier = getFiscalConfig(year).overtimeMultipliers[type];
  return roundMoney(hourlyRate * hours * multiplier);
}
