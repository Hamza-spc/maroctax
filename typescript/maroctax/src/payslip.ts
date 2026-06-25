import { calculateEmployerCost } from './employer-cost.js';
import { calculateNetSalary } from './net-salary.js';
import type { EmployeeInfo, FiscalYear, Payslip } from './types.js';

/**
 * Generates a structured monthly payslip for an employee.
 * @param employeeInfo - Employee identification and role details.
 * @param gross - Monthly gross salary in MAD.
 * @param dependents - Number of dependents.
 * @param year - Fiscal year (defaults to 2025).
 * @param month - Payslip month (1–12, defaults to current month).
 */
export function generatePayslip(
  employeeInfo: EmployeeInfo,
  gross: number,
  dependents = 0,
  year: FiscalYear = 2025,
  month = new Date().getMonth() + 1,
): Payslip {
  return {
    employee: employeeInfo,
    period: { year, month },
    breakdown: calculateNetSalary(gross, dependents, year),
    employerCost: calculateEmployerCost(gross, year),
    generatedAt: new Date().toISOString(),
  };
}
