# maroctax

[![CI](https://github.com/Hamza-spc/maroctax/actions/workflows/ci.yml/badge.svg)](https://github.com/Hamza-spc/maroctax/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/maroctax?label=npm)](https://www.npmjs.com/package/maroctax)
[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-teal)](https://hamza-spc.github.io/maroctax/)

**Moroccan payroll ecosystem** — core engine in TypeScript, Java, and Dart, with Spring Boot, Angular, and Flutter integrations, a live demo, and a public REST API.

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │           maroctax cores            │
                    │   TypeScript · Java · Dart          │
                    └──────────────┬──────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
  Spring Boot starter      maroctax-angular          maroctax_flutter
  MarocTaxService          <maroctax-payslip>        MarocTaxPayslipCard
                           <maroctax-simulator>      MarocTaxSimulatorScreen
         │                         │                         │
         └────────────┬────────────┴─────────────────────────┘
                      ▼
              ┌───────────────┐     ┌────────────────┐
              │  Live demo    │     │   REST API     │
              │  (Angular)    │     │  (Spring Boot) │
              └───────────────┘     └────────────────┘
```

## Live demo

**https://hamza-spc.github.io/maroctax/**

Interactive salary simulator with CNSS, AMO, IR, net salary, employer cost, and raise comparison.

## Install

| Package | Registry | Install |
|---------|----------|---------|
| `maroctax` | npm | `npm install maroctax` |
| `maroctax-angular` | npm | `npm install maroctax-angular` |
| `maroctax-core` | Maven Central | see below |
| `maroctax-spring-boot-starter` | Maven Central | see below |
| `maroctax` | pub.dev | `dart pub add maroctax` |
| `maroctax_flutter` | pub.dev | `flutter pub add maroctax_flutter` |

### Maven

```xml
<dependency>
  <groupId>ma.maroctax</groupId>
  <artifactId>maroctax-core</artifactId>
  <version>1.0.0</version>
</dependency>

<!-- Spring Boot -->
<dependency>
  <groupId>ma.maroctax</groupId>
  <artifactId>maroctax-spring-boot-starter</artifactId>
  <version>1.0.0</version>
</dependency>
```

## Quick start

### TypeScript

```typescript
import { calculateNetSalary, simulateRaise } from 'maroctax';

const breakdown = calculateNetSalary(10000, 0);
console.log(breakdown.net); // 8723.95

const raise = simulateRaise(8000, 10000, 2);
console.log(raise.deltaNet);
```

### Java

```java
import java.math.BigDecimal;
import ma.maroctax.MarocTax;

var result = MarocTax.calculateNetSalary(BigDecimal.valueOf(10000), 0);
System.out.println(result.net());
```

### Dart

```dart
import 'package:maroctax/maroctax.dart';

final result = calculateNetSalary(10000, 0);
print(result.net);
```

### Spring Boot

```java
@Autowired MarocTaxService marocTax;

var result = marocTax.calculateNetSalary(BigDecimal.valueOf(10000), 0);
```

### Angular

```typescript
import { MaroctaxPayslipComponent, MaroctaxSimulatorComponent } from 'maroctax-angular';

// <maroctax-payslip [gross]="10000" [dependents]="0" />
// <maroctax-simulator />
```

### Flutter

```dart
import 'package:maroctax_flutter/maroctax_flutter.dart';

MarocTaxPayslipCard(gross: 10000, dependents: 0)
```

### REST API

```bash
# Start locally
cd java/maroctax-api && mvn spring-boot:run

curl -s -X POST http://localhost:8080/api/v1/net-salary \
  -H 'Content-Type: application/json' \
  -d '{"gross": 10000, "dependents": 0, "year": 2025}'
```

Swagger UI: `http://localhost:8080/swagger-ui.html`

## API reference (8 functions)

| Function | Description |
|----------|-------------|
| `calculateNetSalary` | Full breakdown: CNSS, AMO, frais pro, IR, net |
| `calculateEmployerCost` | Total employer cost (gross + contributions) |
| `reverseFromNet` | Gross salary for a target net |
| `simulateRaise` | Before/after raise comparison |
| `checkSMIG` | Legal minimum wage check (3 500 MAD) |
| `calculateOvertime` | Day / night / holiday overtime pay |
| `calculateSeniority` | Prime d'ancienneté bonus |
| `generatePayslip` | Structured payslip object |

## Fiscal year coverage

| Year | SMIG | IR barème | CNSS | AMO | Status |
|------|------|-----------|------|-----|--------|
| 2024 | 3 500 MAD | LF 2025 barème | 4.48% / 6k cap | 2.26% | Supported |
| 2025 | 3 500 MAD | LF 2025 barème | 4.48% / 6k cap | 2.26% | Supported |

## Development

```bash
# TypeScript
cd typescript/maroctax && npm ci && npm test

# Java
cd java/maroctax-core && mvn test

# Dart
cd dart/maroctax && dart test

# Flutter
cd dart/maroctax_flutter && flutter test

# Demo
cd demo/web && npm start
```

## Release

Tag a version to trigger automated publishing and demo deploy:

```bash
git tag v1.0.0
git push origin v1.0.0
```

**Required GitHub secrets for full publish:** `NPM_TOKEN`, `OSSRH_USERNAME`, `OSSRH_PASSWORD`, `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE`, `PUB_CREDENTIALS`

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run the relevant test suite(s) — all fixtures live in `tests/fixtures.json`
4. Open a PR against `main`

Fiscal rule changes should update `FiscalConfig` in all three cores and recalibrate fixtures.

## License

MIT — see [LICENSE](LICENSE).
