import 'dart:convert';
import 'dart:io';

import 'package:maroctax/maroctax.dart';
import 'package:test/test.dart';

class Fixture {
  Fixture({
    required this.gross,
    required this.dependents,
    required this.expectedNet,
  });

  factory Fixture.fromJson(Map<String, dynamic> json) {
    return Fixture(
      gross: (json['gross'] as num).toDouble(),
      dependents: json['dependents'] as int,
      expectedNet: (json['expectedNet'] as num).toDouble(),
    );
  }

  final double gross;
  final int dependents;
  final double expectedNet;
}

List<Fixture> loadFixtures() {
  final path = '../../tests/fixtures.json';
  final file = File(path);
  final list = jsonDecode(file.readAsStringSync()) as List<dynamic>;
  return list
      .map((e) => Fixture.fromJson(e as Map<String, dynamic>))
      .toList();
}

void main() {
  final fixtures = loadFixtures();

  group('calculateNetSalary', () {
    for (final fixture in fixtures) {
      test('gross ${fixture.gross} dependents ${fixture.dependents}', () {
        final result =
            calculateNetSalary(fixture.gross, fixture.dependents);
        expect(result.net, closeTo(fixture.expectedNet, 0.01));
        expect(result.gross, closeTo(fixture.gross, 0.01));
        expect(result.dependents, fixture.dependents);
      });
    }
  });

  group('calculateEmployerCost', () {
    for (final fixture in fixtures) {
      test('total cost exceeds gross for ${fixture.gross}', () {
        final result = calculateEmployerCost(fixture.gross);
        expect(result.totalCost, greaterThan(fixture.gross));
        expect(result.totalEmployerContributions, greaterThan(0));
      });
    }
  });

  group('reverseFromNet', () {
    for (final fixture in fixtures) {
      test('recovers net for gross ${fixture.gross}', () {
        final gross = reverseFromNet(
          fixture.expectedNet,
          fixture.dependents,
        );
        final net =
            calculateNetSalary(gross, fixture.dependents).net;
        expect(net, closeTo(fixture.expectedNet, 0.01));
        expect(gross, greaterThanOrEqualTo(fixture.expectedNet));
      });
    }
  });

  group('simulateRaise', () {
    for (final fixture in fixtures) {
      test('increases net for gross ${fixture.gross}', () {
        final result = simulateRaise(
          fixture.gross,
          fixture.gross + 1000,
          fixture.dependents,
        );
        expect(result.deltaGross, 1000);
        expect(result.deltaNet, greaterThan(0));
        expect(result.after.net, greaterThan(result.before.net));
      });
    }
  });

  group('checkSmig', () {
    test('returns true at SMIG', () {
      expect(checkSmig(3500), isTrue);
      expect(checkSmig(3499), isFalse);
    });
  });

  group('calculateOvertime', () {
    test('applies premiums', () {
      expect(calculateOvertime(100, 2, OvertimeType.day), 250);
      expect(calculateOvertime(100, 2, OvertimeType.night), 300);
      expect(calculateOvertime(100, 2, OvertimeType.holiday), 400);
    });
  });

  group('calculateSeniority', () {
    test('applies rates', () {
      expect(calculateSeniority(10000, 1), 0);
      expect(calculateSeniority(10000, 3), 500);
    });
  });

  group('generatePayslip', () {
    test('includes breakdown', () {
      final payslip = generatePayslip(
        const EmployeeInfo(id: '1', firstName: 'A', lastName: 'B'),
        10000,
        0,
        FiscalYear.y2025,
        6,
      );

      expect(payslip.employee.firstName, 'A');
      expect(payslip.breakdown.net, closeTo(8723.95, 0.01));
      expect(payslip.employerCost.totalCost, greaterThan(10000));
      expect(payslip.period.month, 6);
    });
  });
}
