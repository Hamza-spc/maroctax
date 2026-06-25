import 'package:flutter/material.dart';
import 'package:maroctax/maroctax.dart';
import 'maroctax_payslip_card.dart';

/// Full-screen salary simulator with dependents and raise comparison.
class MarocTaxSimulatorScreen extends StatefulWidget {
  /// Creates a simulator screen.
  const MarocTaxSimulatorScreen({super.key, this.initialGross = 8000});

  /// Starting gross salary in MAD.
  final double initialGross;

  @override
  State<MarocTaxSimulatorScreen> createState() => _MarocTaxSimulatorScreenState();
}

class _MarocTaxSimulatorScreenState extends State<MarocTaxSimulatorScreen> {
  late double _gross;
  double _newGross = 10000;
  int _dependents = 0;
  bool _raiseMode = false;

  @override
  void initState() {
    super.initState();
    _gross = widget.initialGross;
  }

  @override
  Widget build(BuildContext context) {
    final employer = calculateEmployerCost(_gross);
    final raise = _raiseMode
        ? simulateRaise(_gross, _newGross, _dependents)
        : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Salary simulator')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Gross: ${_gross.toStringAsFixed(0)} MAD'),
          Slider(
            min: 3500,
            max: 30000,
            divisions: 53,
            value: _gross,
            label: _gross.toStringAsFixed(0),
            onChanged: (v) => setState(() => _gross = v),
          ),
          DropdownButtonFormField<int>(
            initialValue: _dependents,
            decoration: const InputDecoration(labelText: 'Dependents'),
            items: List.generate(
              7,
              (i) => DropdownMenuItem(value: i, child: Text('$i')),
            ),
            onChanged: (v) => setState(() => _dependents = v ?? 0),
          ),
          SwitchListTile(
            title: const Text('Simulate raise'),
            value: _raiseMode,
            onChanged: (v) => setState(() => _raiseMode = v),
          ),
          if (_raiseMode) ...[
            Text('New gross: ${_newGross.toStringAsFixed(0)} MAD'),
            Slider(
              min: 3500,
              max: 30000,
              divisions: 53,
              value: _newGross,
              label: _newGross.toStringAsFixed(0),
              onChanged: (v) => setState(() => _newGross = v),
            ),
          ],
          const SizedBox(height: 16),
          MarocTaxPayslipCard(gross: _gross, dependents: _dependents),
          const SizedBox(height: 12),
          _metricTile('Employer cost', employer.totalCost),
          if (raise != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Card(
                color: const Color(0xFFECFDF5),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    'Raise net delta: +${raise.deltaNet.toStringAsFixed(2)} MAD',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _metricTile(String label, double value) {
    return ListTile(
      title: Text(label),
      trailing: Text('${value.toStringAsFixed(2)} MAD'),
    );
  }
}
