import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { calculateNetSalary } from '../../../typescript/maroctax/dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(
  readFileSync(join(__dirname, '../../../tests/fixtures.json'), 'utf8'),
);

for (const fixture of fixtures) {
  const net = calculateNetSalary(fixture.gross, fixture.dependents).net;
  const diff = Math.abs(net - fixture.expectedNet);
  if (diff > 0.01) {
    console.error(
      `Fixture mismatch gross=${fixture.gross}: expected ${fixture.expectedNet}, got ${net}`,
    );
    process.exit(1);
  }
}

console.log('maroctax-angular engine parity: OK');
