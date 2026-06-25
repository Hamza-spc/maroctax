import type { TeamPlan, YearMonth } from '../planner/planner-types';
import { computeTotalsForMonth } from '../planner/planner-utils';
import { csvEscape } from './export-utils';

export function buildMonthlyPayrollCsv(plan: TeamPlan, month: YearMonth): string {
  const { computedEmployees, totals } = computeTotalsForMonth(plan, month);

  const header = [
    'month',
    'planName',
    'year',
    'employeeId',
    'label',
    'startMonth',
    'dependents',
    'inputMode',
    'gross',
    'net',
    'cnssEmployee',
    'amoEmployee',
    'ir',
    'employerCost',
    'employerCnss',
    'employerCnssAccident',
    'employerAmo',
    'employerTraining',
  ];

  const rows = computedEmployees.map((c) => [
    month,
    plan.name,
    plan.year,
    c.employee.id,
    c.employee.label,
    c.employee.startMonth,
    c.employee.dependents,
    c.employee.inputMode,
    c.gross,
    c.breakdown.net,
    c.breakdown.cnss,
    c.breakdown.amo,
    c.breakdown.ir,
    c.employer.totalCost,
    c.employer.employerCnss,
    c.employer.employerCnssAccident,
    c.employer.employerAmo,
    c.employer.employerTraining,
  ]);

  const totalsRow = [
    month,
    plan.name,
    plan.year,
    '',
    'TOTAL',
    '',
    '',
    '',
    totals.totalGross,
    totals.totalNet,
    '',
    '',
    '',
    totals.totalEmployerCost,
    '',
    '',
    '',
    '',
  ];

  const lines = [header, ...rows, totalsRow].map((r) => r.map(csvEscape).join(','));
  return lines.join('\n') + '\n';
}

