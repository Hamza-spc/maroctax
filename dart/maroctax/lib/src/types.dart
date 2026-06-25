/// Supported fiscal years.
enum FiscalYear {
  /// Calendar/fiscal year 2024.
  y2024(2024),

  /// Calendar/fiscal year 2025.
  y2025(2025);

  const FiscalYear(this.value);

  /// Numeric year value.
  final int value;

  /// Resolves a fiscal year from its numeric value.
  static FiscalYear of(int year) {
    return switch (year) {
      2024 => FiscalYear.y2024,
      2025 => FiscalYear.y2025,
      _ => throw ArgumentError('Unsupported fiscal year: $year'),
    };
  }
}

/// Overtime pay category per Moroccan labour rules.
enum OvertimeType {
  /// Standard overtime (25% premium).
  day,

  /// Night overtime (50% premium).
  night,

  /// Holiday overtime (100% premium).
  holiday,
}

/// Progressive income-tax bracket (annual amounts in MAD).
class IrBracket {
  /// Creates an IR bracket.
  const IrBracket({
    required this.upTo,
    required this.rate,
    required this.deduction,
  });

  /// Upper bound of taxable annual income for this bracket (inclusive).
  final double upTo;

  /// Marginal rate applied to income within the bracket.
  final double rate;

  /// Lump-sum deduction for the quick-calculation formula.
  final double deduction;
}

/// Employee information for payslip generation.
class EmployeeInfo {
  /// Creates employee details.
  const EmployeeInfo({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.position,
    this.department,
    this.hireDate,
  });

  /// Employee identifier.
  final String id;

  /// Given name.
  final String firstName;

  /// Family name.
  final String lastName;

  /// Job title.
  final String? position;

  /// Department name.
  final String? department;

  /// Hire date (ISO-8601 string).
  final String? hireDate;
}

/// Full net-salary breakdown.
class SalaryBreakdown {
  /// Creates a salary breakdown.
  const SalaryBreakdown({
    required this.year,
    required this.gross,
    required this.dependents,
    required this.cnss,
    required this.amo,
    required this.fraisProfessionnels,
    required this.netTaxableMonthly,
    required this.netTaxableAnnual,
    required this.dependentDeductionAnnual,
    required this.irGrossAnnual,
    required this.ir,
    required this.net,
  });

  /// Fiscal year used for the calculation.
  final FiscalYear year;

  /// Monthly gross salary in MAD.
  final double gross;

  /// Counted dependents (capped).
  final int dependents;

  /// Employee CNSS contribution.
  final double cnss;

  /// Employee AMO contribution.
  final double amo;

  /// Professional expenses deduction.
  final double fraisProfessionnels;

  /// Monthly net taxable income before IR.
  final double netTaxableMonthly;

  /// Annual net taxable income used for IR.
  final double netTaxableAnnual;

  /// Total annual dependent deduction applied.
  final double dependentDeductionAnnual;

  /// Annual gross IR before family adjustments.
  final double irGrossAnnual;

  /// Monthly IR withheld.
  final double ir;

  /// Monthly net take-home pay.
  final double net;
}

/// Employer-side cost breakdown.
class EmployerCostBreakdown {
  /// Creates an employer cost breakdown.
  const EmployerCostBreakdown({
    required this.gross,
    required this.employerCnss,
    required this.employerCnssAccident,
    required this.employerAmo,
    required this.employerTraining,
    required this.totalEmployerContributions,
    required this.totalCost,
  });

  /// Monthly gross salary in MAD.
  final double gross;

  /// Employer CNSS on capped base.
  final double employerCnss;

  /// Employer workplace-accident contribution.
  final double employerCnssAccident;

  /// Employer AMO contribution.
  final double employerAmo;

  /// Professional training tax.
  final double employerTraining;

  /// Sum of employer contributions.
  final double totalEmployerContributions;

  /// Total cost to employer (gross + contributions).
  final double totalCost;
}

/// Before/after comparison for a salary raise.
class RaiseSimulation {
  /// Creates a raise simulation result.
  const RaiseSimulation({
    required this.year,
    required this.dependents,
    required this.before,
    required this.after,
    required this.deltaGross,
    required this.deltaNet,
    required this.deltaIr,
    required this.marginalNetRate,
  });

  /// Fiscal year.
  final FiscalYear year;

  /// Dependents counted.
  final int dependents;

  /// Breakdown before the raise.
  final SalaryBreakdown before;

  /// Breakdown after the raise.
  final SalaryBreakdown after;

  /// Change in gross salary.
  final double deltaGross;

  /// Change in net salary.
  final double deltaNet;

  /// Change in monthly IR.
  final double deltaIr;

  /// Net gained per MAD of gross increase.
  final double marginalNetRate;
}

/// Structured payslip document.
class Payslip {
  /// Creates a payslip.
  const Payslip({
    required this.employee,
    required this.period,
    required this.breakdown,
    required this.employerCost,
    required this.generatedAt,
  });

  /// Employee details.
  final EmployeeInfo employee;

  /// Payslip period.
  final PayslipPeriod period;

  /// Salary breakdown.
  final SalaryBreakdown breakdown;

  /// Employer cost breakdown.
  final EmployerCostBreakdown employerCost;

  /// Generation timestamp (ISO-8601).
  final String generatedAt;
}

/// Payslip period (year + month).
class PayslipPeriod {
  /// Creates a payslip period.
  const PayslipPeriod({required this.year, required this.month});

  /// Fiscal year.
  final FiscalYear year;

  /// Month number (1–12).
  final int month;
}

/// Seniority rate entry in fiscal configuration.
class SeniorityRate {
  /// Creates a seniority rate rule.
  const SeniorityRate({required this.minYears, required this.rate});

  /// Minimum years of service for this rate.
  final int minYears;

  /// Bonus rate applied to gross salary.
  final double rate;
}

/// Year-specific payroll parameters.
class FiscalConfig {
  /// Creates fiscal configuration.
  const FiscalConfig({
    required this.year,
    required this.smig,
    required this.cnssEmployeeRate,
    required this.cnssEmployeeCap,
    required this.amoEmployeeRate,
    required this.fraisProfessionnelsRate,
    required this.fraisProfessionnelsMonthlyCap,
    required this.dependentDeductionAnnual,
    required this.maxDependents,
    required this.irBrackets,
    required this.employerCnssRate,
    required this.employerCnssAccidentRate,
    required this.employerAmoRate,
    required this.employerTrainingRate,
    required this.overtimeMultipliers,
    required this.seniorityRates,
  });

  /// Fiscal year.
  final FiscalYear year;

  /// Monthly legal minimum wage (SMIG) in MAD.
  final double smig;

  /// Employee CNSS rate.
  final double cnssEmployeeRate;

  /// Monthly gross ceiling for employee CNSS.
  final double cnssEmployeeCap;

  /// Employee AMO rate.
  final double amoEmployeeRate;

  /// Frais professionnels rate on (gross − CNSS − AMO).
  final double fraisProfessionnelsRate;

  /// Maximum monthly frais professionnels deduction.
  final double fraisProfessionnelsMonthlyCap;

  /// Annual family charge deduction per dependent (MAD).
  final double dependentDeductionAnnual;

  /// Maximum number of dependents counted.
  final int maxDependents;

  /// Annual IR progressive brackets.
  final List<IrBracket> irBrackets;

  /// Employer CNSS rate on capped base.
  final double employerCnssRate;

  /// Employer workplace-accident rate on full gross.
  final double employerCnssAccidentRate;

  /// Employer AMO rate.
  final double employerAmoRate;

  /// Professional training tax rate.
  final double employerTrainingRate;

  /// Overtime hourly multipliers by type.
  final Map<OvertimeType, double> overtimeMultipliers;

  /// Seniority bonus rates by years of service.
  final List<SeniorityRate> seniorityRates;
}
