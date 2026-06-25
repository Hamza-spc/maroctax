import 'net_salary.dart';
import 'types.dart';
import 'utils.dart';

/// Compares net salary before and after a gross raise.
RaiseSimulation simulateRaise(
  double currentGross,
  double newGross,
  int dependents, [
  FiscalYear year = FiscalYear.y2025,
]) {
  final before = calculateNetSalary(currentGross, dependents, year);
  final after = calculateNetSalary(newGross, dependents, year);
  final deltaGross = roundMoney(newGross - currentGross);
  final deltaNet = roundMoney(after.net - before.net);
  final deltaIr = roundMoney(after.ir - before.ir);
  final marginalNetRate =
      deltaGross == 0 ? 0.0 : roundMoney(deltaNet / deltaGross);

  return RaiseSimulation(
    year: year,
    dependents: dependents,
    before: before,
    after: after,
    deltaGross: deltaGross,
    deltaNet: deltaNet,
    deltaIr: deltaIr,
    marginalNetRate: marginalNetRate,
  );
}
