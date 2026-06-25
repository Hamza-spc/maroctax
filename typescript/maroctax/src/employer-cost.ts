import { getFiscalConfig } from './fiscal-config.js';
import type { EmployerCostBreakdown, FiscalYear } from './types.js';
import { roundMoney } from './utils.js';

/**
 * Calculates total employer cost including gross salary and employer contributions.
 * @param gross - Monthly gross salary in MAD.
 * @param year - Fiscal year (defaults to 2025).
 */
export function calculateEmployerCost(
  gross: number,
  year: FiscalYear = 2025,
): EmployerCostBreakdown {
  const config = getFiscalConfig(year);
  const cappedBase = Math.min(gross, config.cnssEmployeeCap);

  const employerCnss = roundMoney(cappedBase * config.employerCnssRate);
  const employerCnssAccident = roundMoney(gross * config.employerCnssAccidentRate);
  const employerAmo = roundMoney(gross * config.employerAmoRate);
  const employerTraining = roundMoney(gross * config.employerTrainingRate);
  const totalEmployerContributions = roundMoney(
    employerCnss + employerCnssAccident + employerAmo + employerTraining,
  );

  return {
    gross: roundMoney(gross),
    employerCnss,
    employerCnssAccident,
    employerAmo,
    employerTraining,
    totalEmployerContributions,
    totalCost: roundMoney(gross + totalEmployerContributions),
  };
}
