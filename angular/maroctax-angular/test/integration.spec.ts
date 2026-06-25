import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('maroctax-angular package', () => {
  it('exports payslip and simulator components', () => {
    const api = readFileSync(join(__dirname, '../src/public-api.ts'), 'utf8');
    expect(api).toContain('MaroctaxPayslipComponent');
    expect(api).toContain('MaroctaxSimulatorComponent');
  });

  it('loads shared fixtures', () => {
    const fixtures = JSON.parse(
      readFileSync(join(__dirname, '../../../tests/fixtures.json'), 'utf8'),
    );
    expect(fixtures).toHaveLength(5);
  });

  it('matches maroctax engine for all fixtures', () => {
    execSync('node test/verify-engine.mjs', {
      cwd: join(__dirname, '..'),
      stdio: 'pipe',
    });
  });
});
