import 'fiscal_config.dart';
import 'types.dart';
import 'utils.dart';

/// Calculates seniority bonus (prime d'ancienneté) based on years of service.
double calculateSeniority(
  double grossSalary,
  int yearsOfService, [
  FiscalYear year = FiscalYear.y2025,
]) {
  final rates = getFiscalConfig(year).seniorityRates;
  double rate = 0;

  for (final entry in rates) {
    if (yearsOfService >= entry.minYears) {
      rate = entry.rate;
      break;
    }
  }

  return roundMoney(grossSalary * rate);
}
