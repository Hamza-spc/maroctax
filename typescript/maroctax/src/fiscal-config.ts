import type { FiscalConfig, FiscalYear, IrBracket } from './types.js';

const IR_BRACKETS_2025: IrBracket[] = [
  { upTo: 40_000, rate: 0, deduction: 0 },
  { upTo: 60_000, rate: 0.1, deduction: 4_000 },
  { upTo: 80_000, rate: 0.2, deduction: 10_000 },
  { upTo: 100_000, rate: 0.3, deduction: 18_000 },
  { upTo: 180_000, rate: 0.34, deduction: 22_000 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.37, deduction: 27_400 },
];

const BASE_2025: Omit<FiscalConfig, 'year'> = {
  smig: 3_500,
  cnssEmployeeRate: 0.0448,
  cnssEmployeeCap: 6_000,
  amoEmployeeRate: 0.0226,
  fraisProfessionnelsRate: 0.2,
  fraisProfessionnelsMonthlyCap: 2_500,
  dependentDeductionAnnual: 500,
  maxDependents: 6,
  irBrackets: IR_BRACKETS_2025,
  employerCnssRate: 0.0898,
  employerCnssAccidentRate: 0.0105,
  employerAmoRate: 0.0226,
  employerTrainingRate: 0.016,
  overtimeMultipliers: {
    day: 1.25,
    night: 1.5,
    holiday: 2.0,
  },
  seniorityRates: [
    { minYears: 25, rate: 0.25 },
    { minYears: 20, rate: 0.2 },
    { minYears: 12, rate: 0.15 },
    { minYears: 5, rate: 0.1 },
    { minYears: 2, rate: 0.05 },
  ],
};

/** Registry of fiscal configurations keyed by year. */
export const FISCAL_CONFIGS: Record<FiscalYear, FiscalConfig> = {
  2024: { year: 2024, ...BASE_2025 },
  2025: { year: 2025, ...BASE_2025 },
};

/**
 * Returns the fiscal configuration for a given year.
 * @param year - Payroll fiscal year (defaults to 2025).
 */
export function getFiscalConfig(year: FiscalYear = 2025): FiscalConfig {
  return FISCAL_CONFIGS[year];
}
