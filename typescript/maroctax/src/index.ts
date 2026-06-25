export { calculateAmo } from './amo.js';
export { calculateCnss } from './cnss.js';
export { calculateEmployerCost } from './employer-cost.js';
export { calculateFraisProfessionnels } from './frais-professionnels.js';
export { calculateIrAnnual, calculateIrMonthly } from './ir.js';
export { calculateNetSalary } from './net-salary.js';
export { calculateOvertime } from './overtime.js';
export { generatePayslip } from './payslip.js';
export { reverseFromNet } from './reverse-net.js';
export { calculateSeniority } from './seniority.js';
export { checkSMIG } from './smig.js';
export { simulateRaise } from './simulate-raise.js';
export { FISCAL_CONFIGS, getFiscalConfig } from './fiscal-config.js';
export type {
  EmployeeInfo,
  EmployerCostBreakdown,
  FiscalConfig,
  FiscalYear,
  IrBracket,
  OvertimeType,
  Payslip,
  RaiseSimulation,
  SalaryBreakdown,
} from './types.js';
