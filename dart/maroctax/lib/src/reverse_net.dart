import 'net_salary.dart';
import 'types.dart';
import 'utils.dart';

/// Finds the gross salary that produces a target net (binary search).
double reverseFromNet(
  double targetNet,
  int dependents, [
  FiscalYear year = FiscalYear.y2025,
]) {
  if (targetNet <= 0) {
    return 0;
  }

  var low = targetNet;
  var high = targetNet * 3;

  while (calculateNetSalary(high, dependents, year).net < targetNet) {
    high *= 2;
  }

  for (var i = 0; i < 64; i++) {
    final mid = roundMoney((low + high) / 2);
    final net = calculateNetSalary(mid, dependents, year).net;

    if (net < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
  }

  var gross = (high * 100).ceilToDouble() / 100;

  while (gross > 0 && calculateNetSalary(gross, dependents, year).net > targetNet) {
    gross = roundMoney(gross - 0.01);
  }
  while (calculateNetSalary(gross, dependents, year).net < targetNet) {
    gross = roundMoney(gross + 0.01);
  }

  return gross;
}
