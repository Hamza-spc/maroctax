import 'fiscal_config.dart';
import 'types.dart';
import 'utils.dart';

/// Employee CNSS contribution (4.48% of gross, capped monthly).
double calculateCnss(double gross, [FiscalConfig? config]) {
  final cfg = config ?? getFiscalConfig();
  final base = gross < cfg.cnssEmployeeCap ? gross : cfg.cnssEmployeeCap;
  return roundMoney(base * cfg.cnssEmployeeRate);
}
