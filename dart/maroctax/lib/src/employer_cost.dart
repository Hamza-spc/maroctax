import 'fiscal_config.dart';
import 'types.dart';
import 'utils.dart';

/// Calculates total employer cost including gross salary and employer contributions.
EmployerCostBreakdown calculateEmployerCost(
  double gross, [
  FiscalYear year = FiscalYear.y2025,
]) {
  final config = getFiscalConfig(year);
  final cappedBase =
      gross < config.cnssEmployeeCap ? gross : config.cnssEmployeeCap;

  final employerCnss = roundMoney(cappedBase * config.employerCnssRate);
  final employerCnssAccident =
      roundMoney(gross * config.employerCnssAccidentRate);
  final employerAmo = roundMoney(gross * config.employerAmoRate);
  final employerTraining = roundMoney(gross * config.employerTrainingRate);
  final totalEmployerContributions = roundMoney(
    employerCnss +
        employerCnssAccident +
        employerAmo +
        employerTraining,
  );

  return EmployerCostBreakdown(
    gross: roundMoney(gross),
    employerCnss: employerCnss,
    employerCnssAccident: employerCnssAccident,
    employerAmo: employerAmo,
    employerTraining: employerTraining,
    totalEmployerContributions: totalEmployerContributions,
    totalCost: roundMoney(gross + totalEmployerContributions),
  );
}
