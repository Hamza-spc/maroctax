import 'fiscal_config.dart';
import 'types.dart';
import 'utils.dart';

/// Calculates overtime pay for a given hourly rate, hours, and type.
double calculateOvertime(
  double hourlyRate,
  double hours,
  OvertimeType type, [
  FiscalYear year = FiscalYear.y2025,
]) {
  final multiplier = getFiscalConfig(year).overtimeMultipliers[type]!;
  return roundMoney(hourlyRate * hours * multiplier);
}
