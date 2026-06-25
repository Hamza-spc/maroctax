/** Supported fiscal years. */
export type FiscalYear = 2024 | 2025;

/** Overtime pay category per Moroccan labour rules. */
export type OvertimeType = 'day' | 'night' | 'holiday';

/** Progressive income-tax bracket (annual amounts in MAD). */
export interface IrBracket {
  /** Upper bound of taxable annual income for this bracket (inclusive). */
  upTo: number;
  /** Marginal rate applied to income within the bracket. */
  rate: number;
  /** Lump-sum deduction for the quick-calculation formula. */
  deduction: number;
}

/** Year-specific payroll parameters. */
export interface FiscalConfig {
  year: FiscalYear;
  /** Monthly legal minimum wage (SMIG) in MAD. */
  smig: number;
  /** Employee CNSS rate (fraction of capped gross). */
  cnssEmployeeRate: number;
  /** Monthly gross ceiling for employee CNSS. */
  cnssEmployeeCap: number;
  /** Employee AMO rate (fraction of full gross). */
  amoEmployeeRate: number;
  /** Frais professionnels rate on (gross − CNSS − AMO). */
  fraisProfessionnelsRate: number;
  /** Maximum monthly frais professionnels deduction. */
  fraisProfessionnelsMonthlyCap: number;
  /** Annual family charge deduction per dependent (MAD). */
  dependentDeductionAnnual: number;
  /** Maximum number of dependents counted. */
  maxDependents: number;
  /** Annual IR progressive brackets. */
  irBrackets: IrBracket[];
  /** Employer CNSS pension/allocation rate on capped base. */
  employerCnssRate: number;
  /** Employer workplace-accident rate on full gross. */
  employerCnssAccidentRate: number;
  /** Employer AMO rate on full gross. */
  employerAmoRate: number;
  /** Professional training tax (taxe de formation professionnelle). */
  employerTrainingRate: number;
  /** Overtime hourly multipliers. */
  overtimeMultipliers: Record<OvertimeType, number>;
  /** Seniority bonus rates by years of service (min years → rate on gross). */
  seniorityRates: Array<{ minYears: number; rate: number }>;
}

/** Employee information for payslip generation. */
export interface EmployeeInfo {
  id: string;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  hireDate?: string;
}

/** Full net-salary breakdown. */
export interface SalaryBreakdown {
  year: FiscalYear;
  gross: number;
  dependents: number;
  cnss: number;
  amo: number;
  fraisProfessionnels: number;
  /** Monthly net taxable income before IR. */
  netTaxableMonthly: number;
  /** Annual net taxable income used for IR. */
  netTaxableAnnual: number;
  dependentDeductionAnnual: number;
  irGrossAnnual: number;
  ir: number;
  net: number;
}

/** Employer-side cost breakdown. */
export interface EmployerCostBreakdown {
  gross: number;
  employerCnss: number;
  employerCnssAccident: number;
  employerAmo: number;
  employerTraining: number;
  totalEmployerContributions: number;
  totalCost: number;
}

/** Before/after comparison for a salary raise. */
export interface RaiseSimulation {
  year: FiscalYear;
  dependents: number;
  before: SalaryBreakdown;
  after: SalaryBreakdown;
  deltaGross: number;
  deltaNet: number;
  deltaIr: number;
  marginalNetRate: number;
}

/** Structured payslip document. */
export interface Payslip {
  employee: EmployeeInfo;
  period: { year: FiscalYear; month: number };
  breakdown: SalaryBreakdown;
  employerCost: EmployerCostBreakdown;
  generatedAt: string;
}
