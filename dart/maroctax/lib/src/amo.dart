import 'fiscal_config.dart';
import 'types.dart';
import 'utils.dart';

/// Employee AMO contribution (2.26% of full gross, no cap).
double calculateAmo(double gross, [FiscalConfig? config]) {
  final cfg = config ?? getFiscalConfig();
  return roundMoney(gross * cfg.amoEmployeeRate);
}
