import 'employer_cost.dart';
import 'net_salary.dart';
import 'types.dart';

/// Generates a structured monthly payslip for an employee.
Payslip generatePayslip(
  EmployeeInfo employeeInfo,
  double gross,
  int dependents, [
  FiscalYear year = FiscalYear.y2025,
  int? month,
]) {
  final payslipMonth = month ?? DateTime.now().month;

  return Payslip(
    employee: employeeInfo,
    period: PayslipPeriod(year: year, month: payslipMonth),
    breakdown: calculateNetSalary(gross, dependents, year),
    employerCost: calculateEmployerCost(gross, year),
    generatedAt: DateTime.now().toUtc().toIso8601String(),
  );
}
