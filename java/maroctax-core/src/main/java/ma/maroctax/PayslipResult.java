package ma.maroctax;

import java.time.Instant;

/** Structured payslip document. */
public record PayslipResult(
    EmployeeInfo employee,
    FiscalYear year,
    int month,
    SalaryResult breakdown,
    EmployerCostResult employerCost,
    Instant generatedAt) {}
