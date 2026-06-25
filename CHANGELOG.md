# Changelog

## [1.0.0] — 2025-06-25

### Added

- **Core engines** (TypeScript, Java, Dart) with 2025 Moroccan fiscal rules
  - CNSS (4.48%, cap 6 000 MAD), AMO (2.26%), frais professionnels (20%), IR barème
  - `calculateNetSalary`, `calculateEmployerCost`, `reverseFromNet`, `simulateRaise`
  - `checkSMIG`, `calculateOvertime`, `calculateSeniority`, `generatePayslip`
- **Shared fixtures** for cross-language and API contract tests
- **maroctax-spring-boot-starter** — `MarocTaxService` auto-configuration
- **maroctax-angular** — `<maroctax-payslip>` and `<maroctax-simulator>` components
- **maroctax_flutter** — `MarocTaxPayslipCard` and `MarocTaxSimulatorScreen` widgets
- **Live demo** — Angular app at [hamza-spc.github.io/maroctax](https://hamza-spc.github.io/maroctax/)
- **REST API** — Spring Boot `/api/v1/*` endpoints with OpenAPI/Swagger
- **CI** — GitHub Actions test matrix on every push
- **Release workflow** — tag `v*.*.*` triggers npm, Maven Central, pub.dev, and Pages deploy

### Fiscal coverage

- SMIG 2025: 3 500 MAD/month
- IR barème LF 2025 (0% → 37%)
- Dependents deduction: 500 MAD/year each (max 6)

[1.0.0]: https://github.com/Hamza-spc/maroctax/releases/tag/v1.0.0
