import 'package:flutter/material.dart';
import 'package:maroctax/maroctax.dart';

/// Styled card showing CNSS, AMO, IR, and net salary breakdown.
class MarocTaxPayslipCard extends StatelessWidget {
  /// Creates a payslip card.
  const MarocTaxPayslipCard({
    required this.gross,
    super.key,
    this.dependents = 0,
    this.year = FiscalYear.y2025,
  });

  /// Monthly gross salary in MAD.
  final double gross;

  /// Number of dependents (0–6).
  final int dependents;

  /// Fiscal year for calculations.
  final FiscalYear year;

  @override
  Widget build(BuildContext context) {
    final breakdown = calculateNetSalary(gross, dependents, year);
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: theme.dividerColor),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Payslip breakdown', style: theme.textTheme.titleMedium),
            const SizedBox(height: 4),
            Text(
              '${gross.toStringAsFixed(0)} MAD gross · $dependents dependents',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 12),
            _row(context, 'CNSS', -breakdown.cnss),
            _row(context, 'AMO', -breakdown.amo),
            _row(context, 'Frais pro', -breakdown.fraisProfessionnels),
            _row(context, 'IR', -breakdown.ir),
            const Divider(height: 20),
            _row(
              context,
              'Net salary',
              breakdown.net,
              emphasize: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(
    BuildContext context,
    String label,
    double amount, {
    bool emphasize = false,
  }) {
    final style = emphasize
        ? Theme.of(context).textTheme.titleSmall?.copyWith(
              color: const Color(0xFF0F766E),
              fontWeight: FontWeight.bold,
            )
        : Theme.of(context).textTheme.bodyMedium;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          Text('${amount.toStringAsFixed(2)} MAD', style: style),
        ],
      ),
    );
  }
}
