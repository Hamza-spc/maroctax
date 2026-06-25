import 'fiscal_config.dart';
import 'types.dart';

/// Checks whether gross salary meets the legal minimum (SMIG).
bool checkSmig(double gross, [FiscalYear year = FiscalYear.y2025]) {
  return gross >= getFiscalConfig(year).smig;
}
