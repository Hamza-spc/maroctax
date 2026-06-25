import 'types.dart';

const _irBrackets2025 = <IrBracket>[
  IrBracket(upTo: 40000, rate: 0, deduction: 0),
  IrBracket(upTo: 60000, rate: 0.10, deduction: 4000),
  IrBracket(upTo: 80000, rate: 0.20, deduction: 10000),
  IrBracket(upTo: 100000, rate: 0.30, deduction: 18000),
  IrBracket(upTo: 180000, rate: 0.34, deduction: 22000),
  IrBracket(upTo: double.infinity, rate: 0.37, deduction: 27400),
];

const _base2025 = FiscalConfig(
  year: FiscalYear.y2025,
  smig: 3500,
  cnssEmployeeRate: 0.0448,
  cnssEmployeeCap: 6000,
  amoEmployeeRate: 0.0226,
  fraisProfessionnelsRate: 0.20,
  fraisProfessionnelsMonthlyCap: 2500,
  dependentDeductionAnnual: 500,
  maxDependents: 6,
  irBrackets: _irBrackets2025,
  employerCnssRate: 0.0898,
  employerCnssAccidentRate: 0.0105,
  employerAmoRate: 0.0226,
  employerTrainingRate: 0.016,
  overtimeMultipliers: {
    OvertimeType.day: 1.25,
    OvertimeType.night: 1.50,
    OvertimeType.holiday: 2.00,
  },
  seniorityRates: [
    SeniorityRate(minYears: 25, rate: 0.25),
    SeniorityRate(minYears: 20, rate: 0.20),
    SeniorityRate(minYears: 12, rate: 0.15),
    SeniorityRate(minYears: 5, rate: 0.10),
    SeniorityRate(minYears: 2, rate: 0.05),
  ],
);

/// Registry of fiscal configurations keyed by year.
final Map<FiscalYear, FiscalConfig> fiscalConfigs = {
  FiscalYear.y2024: _base2025.copyWith(year: FiscalYear.y2024),
  FiscalYear.y2025: _base2025,
};

/// Returns the fiscal configuration for a given year.
FiscalConfig getFiscalConfig([FiscalYear year = FiscalYear.y2025]) {
  return fiscalConfigs[year]!;
}

extension on FiscalConfig {
  FiscalConfig copyWith({FiscalYear? year}) {
    return FiscalConfig(
      year: year ?? this.year,
      smig: smig,
      cnssEmployeeRate: cnssEmployeeRate,
      cnssEmployeeCap: cnssEmployeeCap,
      amoEmployeeRate: amoEmployeeRate,
      fraisProfessionnelsRate: fraisProfessionnelsRate,
      fraisProfessionnelsMonthlyCap: fraisProfessionnelsMonthlyCap,
      dependentDeductionAnnual: dependentDeductionAnnual,
      maxDependents: maxDependents,
      irBrackets: irBrackets,
      employerCnssRate: employerCnssRate,
      employerCnssAccidentRate: employerCnssAccidentRate,
      employerAmoRate: employerAmoRate,
      employerTrainingRate: employerTrainingRate,
      overtimeMultipliers: overtimeMultipliers,
      seniorityRates: seniorityRates,
    );
  }
}
