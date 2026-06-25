import { calculateAmo } from './amo.js';
import { calculateCnss } from './cnss.js';
import { getFiscalConfig } from './fiscal-config.js';
import { calculateFraisProfessionnels } from './frais-professionnels.js';
import { calculateIrAnnual } from './ir.js';
import type { FiscalYear, SalaryBreakdown } from './types.js';
import { clampDependents, roundMoney } from './utils.js';

/**
 * Calculates monthly net salary with a full deduction breakdown.
 * @param gross - Monthly gross salary in MAD.
 * @param dependents - Number of dependents (max 6).
 * @param year - Fiscal year (defaults to 2025).
 */
export function calculateNetSalary(
  gross: number,
  dependents = 0,
  year: FiscalYear = 2025,
): SalaryBreakdown {
  const config = getFiscalConfig(year);
  const countedDependents = clampDependents(dependents, config.maxDependents);

  const cnss = calculateCnss(gross, config);
  const amo = calculateAmo(gross, config);
  const grossAfterSocial = roundMoney(gross - cnss - amo);
  const fraisProfessionnels = calculateFraisProfessionnels(grossAfterSocial, config);
  const netTaxableMonthly = roundMoney(grossAfterSocial - fraisProfessionnels);
  const dependentDeductionAnnual = countedDependents * config.dependentDeductionAnnual;
  const netTaxableAnnual = roundMoney(
    Math.max(0, netTaxableMonthly * 12 - dependentDeductionAnnual),
  );
  const irGrossAnnual = calculateIrAnnual(netTaxableAnnual, config);
  const ir = roundMoney(irGrossAnnual / 12);
  const net = roundMoney(gross - cnss - amo - ir);

  return {
    year,
    gross: roundMoney(gross),
    dependents: countedDependents,
    cnss,
    amo,
    fraisProfessionnels,
    netTaxableMonthly,
    netTaxableAnnual,
    dependentDeductionAnnual,
    irGrossAnnual,
    ir,
    net,
  };
}
