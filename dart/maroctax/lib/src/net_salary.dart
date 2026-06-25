import 'amo.dart';
import 'cnss.dart';
import 'fiscal_config.dart';
import 'frais_professionnels.dart';
import 'ir.dart';
import 'types.dart';
import 'utils.dart';

/// Calculates monthly net salary with a full deduction breakdown.
SalaryBreakdown calculateNetSalary(
  double gross,
  int dependents, [
  FiscalYear year = FiscalYear.y2025,
]) {
  final config = getFiscalConfig(year);
  final countedDependents = clampDependents(dependents, config.maxDependents);

  final cnss = calculateCnss(gross, config);
  final amo = calculateAmo(gross, config);
  final grossAfterSocial = roundMoney(gross - cnss - amo);
  final fraisProfessionnels =
      calculateFraisProfessionnels(grossAfterSocial, config);
  final netTaxableMonthly = roundMoney(grossAfterSocial - fraisProfessionnels);
  final dependentDeductionAnnual =
      countedDependents * config.dependentDeductionAnnual;
  final netTaxableAnnual = roundMoney(
    (netTaxableMonthly * 12 - dependentDeductionAnnual) < 0
        ? 0
        : netTaxableMonthly * 12 - dependentDeductionAnnual,
  );
  final irGrossAnnual = calculateIrAnnual(netTaxableAnnual, config);
  final ir = roundMoney(irGrossAnnual / 12);
  final net = roundMoney(gross - cnss - amo - ir);

  return SalaryBreakdown(
    year: year,
    gross: roundMoney(gross),
    dependents: countedDependents,
    cnss: cnss,
    amo: amo,
    fraisProfessionnels: fraisProfessionnels,
    netTaxableMonthly: netTaxableMonthly,
    netTaxableAnnual: netTaxableAnnual,
    dependentDeductionAnnual: dependentDeductionAnnual,
    irGrossAnnual: irGrossAnnual,
    ir: ir,
    net: net,
  );
}
