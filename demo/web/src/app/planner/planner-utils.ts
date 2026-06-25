import {
  EmployerCostBreakdown,
  FiscalYear,
  SalaryBreakdown,
  calculateEmployerCost,
  calculateNetSalary,
  reverseFromNet,
} from 'maroctax';
import type { EmployeePlan, TeamPlan, YearMonth } from './planner-types';

export function clampDependents(d: number): number {
  if (!Number.isFinite(d)) return 0;
  return Math.min(6, Math.max(0, Math.round(d)));
}

export function parseYearMonth(value: string): YearMonth {
  // very light validation (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return '2026-01';
  }
  return value as YearMonth;
}

export function currentYearMonth(): YearMonth {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}` as YearMonth;
}

export function addMonths(ym: YearMonth, delta: number): YearMonth {
  const [yStr, mStr] = ym.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const date = new Date(y, m - 1 + delta, 1);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yy}-${mm}` as YearMonth;
}

export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function isActiveInMonth(employee: EmployeePlan, month: YearMonth): boolean {
  return compareYearMonth(employee.startMonth, month) <= 0;
}

export function computeEmployeeGross(employee: EmployeePlan, year: FiscalYear): number {
  const dependents = clampDependents(employee.dependents);
  if (employee.inputMode === 'targetNet') {
    const targetNet = Number(employee.targetNet ?? 0);
    return reverseFromNet(targetNet, dependents, year);
  }
  return Number(employee.gross ?? 0);
}

export interface EmployeeComputed {
  employee: EmployeePlan;
  gross: number;
  breakdown: SalaryBreakdown;
  employer: EmployerCostBreakdown;
}

export function computeEmployee(employee: EmployeePlan, year: FiscalYear): EmployeeComputed {
  const dependents = clampDependents(employee.dependents);
  const gross = computeEmployeeGross(employee, year);
  return {
    employee: { ...employee, dependents },
    gross,
    breakdown: calculateNetSalary(gross, dependents, year),
    employer: calculateEmployerCost(gross, year),
  };
}

export interface MonthTotals {
  month: YearMonth;
  totalGross: number;
  totalNet: number;
  totalEmployerCost: number;
}

export function computeTotalsForMonth(plan: TeamPlan, month: YearMonth): {
  computedEmployees: EmployeeComputed[];
  totals: MonthTotals;
} {
  const active = plan.employees.filter((e) => isActiveInMonth(e, month));
  const computedEmployees = active.map((e) => computeEmployee(e, plan.year));
  const totals = computedEmployees.reduce<MonthTotals>(
    (acc, c) => ({
      ...acc,
      totalGross: acc.totalGross + c.gross,
      totalNet: acc.totalNet + c.breakdown.net,
      totalEmployerCost: acc.totalEmployerCost + c.employer.totalCost,
    }),
    { month, totalGross: 0, totalNet: 0, totalEmployerCost: 0 },
  );
  return { computedEmployees, totals };
}

export function defaultPlan(year: FiscalYear): TeamPlan {
  return {
    version: 1,
    name: 'My team plan',
    year,
    employees: [
      {
        id: cryptoRandomId(),
        label: 'Engineer',
        dependents: 0,
        startMonth: currentYearMonth(),
        inputMode: 'targetNet',
        targetNet: 12000,
      },
      {
        id: cryptoRandomId(),
        label: 'Sales',
        dependents: 1,
        startMonth: addMonths(currentYearMonth(), 1),
        inputMode: 'gross',
        gross: 15000,
      },
    ],
  };
}

export function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

