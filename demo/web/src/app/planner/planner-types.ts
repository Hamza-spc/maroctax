import type { FiscalYear } from 'maroctax';

export type EmployeeInputMode = 'gross' | 'targetNet';

export type YearMonth = `${number}-${string}`;

export interface EmployeePlan {
  id: string;
  label: string;
  dependents: number;
  startMonth: YearMonth;
  inputMode: EmployeeInputMode;
  gross?: number;
  targetNet?: number;
}

export interface TeamPlan {
  version: 1;
  name: string;
  year: FiscalYear;
  employees: EmployeePlan[];
}

