import { getFiscalConfig } from './fiscal-config.js';
import type { FiscalYear } from './types.js';
import { roundMoney } from './utils.js';

/**
 * Calculates seniority bonus (prime d'ancienneté) based on years of service.
 * Applies from 2 years of service per Moroccan labour law.
 * @param grossSalary - Monthly gross salary in MAD.
 * @param yearsOfService - Completed years of service.
 * @param year - Fiscal year (defaults to 2025).
 */
export function calculateSeniority(
  grossSalary: number,
  yearsOfService: number,
  year: FiscalYear = 2025,
): number {
  const rates = getFiscalConfig(year).seniorityRates;
  const rate = rates.find((entry) => yearsOfService >= entry.minYears)?.rate ?? 0;
  return roundMoney(grossSalary * rate);
}
