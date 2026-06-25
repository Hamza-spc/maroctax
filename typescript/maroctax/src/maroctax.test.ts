import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  calculateEmployerCost,
  calculateNetSalary,
  calculateOvertime,
  calculateSeniority,
  checkSMIG,
  generatePayslip,
  reverseFromNet,
  simulateRaise,
} from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesPath = join(__dirname, '../../../tests/fixtures.json');

interface Fixture {
  gross: number;
  dependents: number;
  expectedNet: number;
}

const fixtures: Fixture[] = JSON.parse(readFileSync(fixturesPath, 'utf-8'));

describe('calculateNetSalary', () => {
  it.each(fixtures)(
    'gross $gross dependents $dependents → net $expectedNet',
    ({ gross, dependents, expectedNet }) => {
      const result = calculateNetSalary(gross, dependents);
      expect(result.net).toBeCloseTo(expectedNet, 2);
      expect(result.gross).toBeCloseTo(gross, 2);
      expect(result.dependents).toBe(dependents);
    },
  );
});

describe('calculateEmployerCost', () => {
  it.each(fixtures)('returns positive total cost for gross $gross', ({ gross }) => {
    const result = calculateEmployerCost(gross);
    expect(result.totalCost).toBeGreaterThan(gross);
    expect(result.totalEmployerContributions).toBeGreaterThan(0);
  });
});

describe('reverseFromNet', () => {
  it.each(fixtures)(
    'recovers gross from net for gross $gross dependents $dependents',
    ({ gross, dependents, expectedNet }) => {
      const recoveredGross = reverseFromNet(expectedNet, dependents);
      const net = calculateNetSalary(recoveredGross, dependents).net;
      expect(net).toBeCloseTo(expectedNet, 2);
      expect(recoveredGross).toBeGreaterThanOrEqual(expectedNet);
    },
  );
});

describe('simulateRaise', () => {
  it.each(fixtures)('computes delta for raise on gross $gross', ({ gross, dependents }) => {
    const result = simulateRaise(gross, gross + 1000, dependents);
    expect(result.deltaGross).toBe(1000);
    expect(result.deltaNet).toBeGreaterThan(0);
    expect(result.after.net).toBeGreaterThan(result.before.net);
  });
});

describe('checkSMIG', () => {
  it('returns true at SMIG', () => {
    expect(checkSMIG(3500)).toBe(true);
  });

  it('returns false below SMIG', () => {
    expect(checkSMIG(3499)).toBe(false);
  });
});

describe('calculateOvertime', () => {
  it('applies day premium', () => {
    expect(calculateOvertime(100, 2, 'day')).toBe(250);
  });

  it('applies night premium', () => {
    expect(calculateOvertime(100, 2, 'night')).toBe(300);
  });

  it('applies holiday premium', () => {
    expect(calculateOvertime(100, 2, 'holiday')).toBe(400);
  });
});

describe('calculateSeniority', () => {
  it('returns zero before 2 years', () => {
    expect(calculateSeniority(10000, 1)).toBe(0);
  });

  it('returns 5% at 3 years', () => {
    expect(calculateSeniority(10000, 3)).toBe(500);
  });
});

describe('generatePayslip', () => {
  it('includes employee and breakdown', () => {
    const payslip = generatePayslip(
      { id: '1', firstName: 'A', lastName: 'B' },
      10000,
      0,
      2025,
      6,
    );
    expect(payslip.employee.firstName).toBe('A');
    expect(payslip.breakdown.net).toBeCloseTo(8723.95, 2);
    expect(payslip.employerCost.totalCost).toBeGreaterThan(10000);
    expect(payslip.period.month).toBe(6);
  });
});
