import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:maroctax/maroctax.dart';
import 'package:maroctax_flutter/maroctax_flutter.dart';

void main() {
  final fixtures = _loadFixtures();

  group('MarocTaxPayslipCard', () {
    testWidgets('renders net salary for fixture gross 5000', (tester) async {
      const expectedNet = 4627.46;

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: MarocTaxPayslipCard(gross: 5000, dependents: 1),
          ),
        ),
      );

      expect(find.text('Payslip breakdown'), findsOneWidget);
      expect(find.textContaining('4627.46'), findsOneWidget);
      expect(calculateNetSalary(5000, 1).net, closeTo(expectedNet, 0.01));
    });
  });

  group('MarocTaxSimulatorScreen', () {
    testWidgets('shows simulator title and payslip card', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: MarocTaxSimulatorScreen()),
      );

      expect(find.text('Salary simulator'), findsOneWidget);
      expect(find.text('Payslip breakdown'), findsOneWidget);
    });
  });

  group('fixture parity', () {
    for (final fixture in fixtures) {
      test('gross ${fixture['gross']} dependents ${fixture['dependents']}', () {
        final gross = (fixture['gross'] as num).toDouble();
        final dependents = fixture['dependents'] as int;
        final expected = (fixture['expectedNet'] as num).toDouble();
        final net = calculateNetSalary(gross, dependents).net;
        expect(net, closeTo(expected, 0.01));
      });
    }
  });
}

List<Map<String, dynamic>> _loadFixtures() {
  final file = File('../../tests/fixtures.json');
  return (jsonDecode(file.readAsStringSync()) as List)
      .cast<Map<String, dynamic>>();
}
