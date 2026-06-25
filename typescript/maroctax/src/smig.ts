import { getFiscalConfig } from './fiscal-config.js';
import type { FiscalYear } from './types.js';

/**
 * Checks whether gross salary meets the legal minimum (SMIG).
 * @param gross - Monthly gross salary in MAD.
 * @param year - Fiscal year (defaults to 2025).
 */
export function checkSMIG(gross: number, year: FiscalYear = 2025): boolean {
  return gross >= getFiscalConfig(year).smig;
}
