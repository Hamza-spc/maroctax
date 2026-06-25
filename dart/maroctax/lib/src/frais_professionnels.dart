import 'fiscal_config.dart';
import 'types.dart';
import 'utils.dart';

/// Professional expenses deduction (frais professionnels).
double calculateFraisProfessionnels(
  double grossAfterSocial, [
  FiscalConfig? config,
]) {
  final cfg = config ?? getFiscalConfig();
  final uncapped = grossAfterSocial * cfg.fraisProfessionnelsRate;
  return roundMoney(
    uncapped < cfg.fraisProfessionnelsMonthlyCap
        ? uncapped
        : cfg.fraisProfessionnelsMonthlyCap,
  );
}
