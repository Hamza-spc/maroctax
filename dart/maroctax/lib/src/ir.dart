import 'fiscal_config.dart';
import 'types.dart';
import 'utils.dart';

/// Annual gross income tax from progressive barème.
double calculateIrAnnual(double netTaxableAnnual, [FiscalConfig? config]) {
  final cfg = config ?? getFiscalConfig();
  final taxable = netTaxableAnnual < 0 ? 0 : netTaxableAnnual;

  for (final bracket in cfg.irBrackets) {
    if (taxable <= bracket.upTo) {
      final ir = taxable * bracket.rate - bracket.deduction;
      return roundMoney(ir < 0 ? 0 : ir);
    }
  }

  return 0;
}

/// Monthly income tax withheld from salary.
double calculateIrMonthly(double netTaxableMonthly, [FiscalConfig? config]) {
  final annual = calculateIrAnnual(netTaxableMonthly * 12, config);
  return roundMoney(annual / 12);
}
