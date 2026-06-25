# maroctax — Implementation Plan

> Open-source Moroccan payroll engine (TypeScript · Java · Dart)  
> Repo: [https://github.com/Hamza-spc/maroctax](https://github.com/Hamza-spc/maroctax)

This document is the north-star roadmap. Each step ends with **git add → commit → push** so `main` stays deployable and history is easy to bisect.

---

## Phase 0 — Repository bootstrap

**Goal:** Local workspace matches GitHub; planning doc is the first tracked artifact.

| Step | Action | Details |
|------|--------|---------|
| 0.1 | Clone / init remote | `git init`, `git remote add origin https://github.com/Hamza-spc/maroctax.git`, `git pull origin main` |
| 0.2 | Add this plan | Commit `IMPLEMENTATION_PLAN.md` (this file) |

**Git (after 0.2):**
```bash
git add IMPLEMENTATION_PLAN.md
git commit -m "docs: add phased implementation plan for maroctax"
git push -u origin main
```

**Done when:** `main` on GitHub contains README, LICENSE, and this plan.

---

## Phase 1 — Project skeleton & shared fixtures

**Goal:** Monorepo layout and a single source of truth for cross-language tests.

### Step 1.1 — Folder skeleton

Create:
```
maroctax/
├── java/
├── typescript/
├── dart/
├── tests/
│   └── fixtures.json
├── README.md          (keep placeholder; expand in Phase 6)
├── LICENSE
└── IMPLEMENTATION_PLAN.md
```

**Git:**
```bash
git add java/ typescript/ dart/ tests/
git commit -m "chore: add monorepo folder skeleton for java, typescript, dart"
git push origin main
```

### Step 1.2 — `fixtures.json` (single source of truth)

Create `tests/fixtures.json` with shared payroll scenarios. All three language test suites will load this file (or a copy generated from it).

```json
[
  { "gross": 3500,  "dependents": 0, "expectedNet": 3241.10 },
  { "gross": 5000,  "dependents": 1, "expectedNet": 4523.80 },
  { "gross": 8000,  "dependents": 2, "expectedNet": 6891.40 },
  { "gross": 10000, "dependents": 0, "expectedNet": 8405.20 },
  { "gross": 20000, "dependents": 3, "expectedNet": 15632.00 }
]
```

**Verification (manual, before commit):** Once TypeScript exists, re-run fixtures; for now, document expected values only.

**Git:**
```bash
git add tests/fixtures.json
git commit -m "test: add shared payroll fixtures for cross-language parity"
git push origin main
```

**Done when:** Skeleton exists; fixtures are committed; no implementation code yet.

---

## Phase 2 — TypeScript core (Day 1)

**Goal:** Fastest iteration path — full fiscal logic, typed API, Jest tests against fixtures.

### Fiscal rules (2025 baseline — encode in `FiscalConfig`)

| Rule | Value |
|------|-------|
| CNSS employee | 4.48% of gross, cap 6 000 MAD/month |
| AMO employee | 2.26% of gross, no cap |
| Frais professionnels | 20% of `(gross - CNSS - AMO)` |
| IR barème (annual) | 0–40k @ 0%; 40 001–60k @ 10% (−4 000); 60 001–80k @ 20% (−10 000); 80 001–100k @ 30% (−18 000); 100 001–180k @ 34% (−22 000); >180k @ 37% (−27 400) |
| Dependents | 500 MAD/year each, max 6 |
| SMIG 2025 | 3 500 MAD/month |

### Step 2.1 — Package scaffold

Under `typescript/`:
- `package.json` (name: `maroctax`, MIT, `"type": "module"` or CJS per preference)
- `tsconfig.json`
- `src/index.ts` (re-exports)
- `src/fiscal-config.ts` — year-keyed `FiscalConfig` (2024, 2025 stubs)
- `src/types.ts` — breakdown, payslip, overtime types

**Git:**
```bash
git add typescript/
git commit -m "feat(ts): scaffold maroctax npm package with FiscalConfig and types"
git push origin main
```

### Step 2.2 — Core deductions & IR

Implement in focused modules (suggested):
- `src/cnss.ts`, `src/amo.ts`, `src/frais-professionnels.ts`, `src/ir.ts`

**`calculateNetSalary(gross, dependents, year)`** returns full breakdown:
- gross, cnss, amo, fraisProfessionnels, taxableBase (annual), ir (monthly), net, dependentsDeduction, etc.

**Review checkpoint:** IR annual → monthly proration and bracket math — compare each fixture by hand.

**Git:**
```bash
git add typescript/src/
git commit -m "feat(ts): implement CNSS, AMO, frais pro, and IR barème calculation"
git push origin main
```

### Step 2.3 — Remaining public API

| Function | Behavior |
|----------|----------|
| `calculateEmployerCost(gross)` | Employer CNSS/AMO + gross (document employer rates in config) |
| `reverseFromNet(targetNet, dependents)` | Binary search or analytic inverse on gross |
| `simulateRaise(currentGross, newGross, dependents)` | Before/after breakdown + delta |
| `checkSMIG(gross)` | `gross >= smig` for year |
| `calculateOvertime(hourlyRate, hours, type)` | `type`: `'day'` \| `'night'` \| `'holiday'` — document multipliers in config |
| `calculateSeniority(grossSalary, yearsOfService)` | Seniority bonus per Moroccan rules in config |
| `generatePayslip(employeeInfo, gross, dependents)` | Structured payslip object |

JSDoc on every exported function.

**Git:**
```bash
git add typescript/src/
git commit -m "feat(ts): add employer cost, reverse net, raise sim, SMIG, overtime, seniority, payslip"
git push origin main
```

### Step 2.4 — Jest tests

- `typescript/jest.config.*`
- One test per fixture for `calculateNetSalary` (and smoke tests for other functions)
- Load `../../tests/fixtures.json`

**Git:**
```bash
git add typescript/
git commit -m "test(ts): add Jest suite against shared fixtures"
git push origin main
```

### Step 2.5 — Build & local verify

- `npm run build` → `dist/`
- `npm test` — all green
- Manually spot-check IR for `gross: 10000, dependents: 0`

**Git:**
```bash
git add typescript/
git commit -m "chore(ts): configure build output and verify all tests pass"
git push origin main
```

**Done when:** TypeScript is the reference implementation; fixtures pass; API frozen for ports.

---

## Phase 3 — Java port (Day 2)

**Goal:** Java 21, Maven, `BigDecimal` only — no `double` for money.

### Step 3.1 — Maven scaffold

Under `java/`:
- `pom.xml` — Java 21, JUnit 5, compiler plugin
- `src/main/java/.../MarocTax.java` — static entry point
- `src/main/java/.../FiscalConfig.java`
- Records: `SalaryResult`, `PayslipResult`, etc.

**Git:**
```bash
git add java/
git commit -m "feat(java): scaffold Maven project with MarocTax and FiscalConfig"
git push origin main
```

### Step 3.2 — Port fiscal logic

Mirror TypeScript modules:
- CNSS, AMO, frais pro, IR, employer cost, reverse net, raise sim, SMIG, overtime, seniority, payslip

**Rule:** Every monetary value is `BigDecimal`; use `RoundingMode` consistently (document HALF_UP vs banker's choice).

**Git:**
```bash
git add java/src/main/
git commit -m "feat(java): port Moroccan payroll logic with BigDecimal"
git push origin main
```

### Step 3.3 — JUnit 5 + fixtures

- Read `tests/fixtures.json` from test resources (copy or relative path in CI)
- Assert `expectedNet` matches within 0.01 MAD

**Git:**
```bash
git add java/src/test/
git commit -m "test(java): add JUnit tests matching TypeScript fixtures"
git push origin main
```

### Step 3.4 — `mvn test` green

**Git:**
```bash
git add java/
git commit -m "chore(java): verify mvn test passes on CI-ready project"
git push origin main
```

**Done when:** Java outputs match TypeScript for all fixtures.

---

## Phase 4 — Dart port (Day 3, part A)

**Goal:** pub.dev-ready package; Flutter + pure Dart.

### Step 4.1 — Package scaffold

Under `dart/`:
- `pubspec.yaml` — name `maroctax`, SDK constraint, `test` dev_dependency
- `lib/maroctax.dart` — barrel export
- `lib/src/fiscal_config.dart`, `ir.dart`, `cnss.dart`, `amo.dart`, `payslip.dart`, etc.

**Git:**
```bash
git add dart/
git commit -m "feat(dart): scaffold pub package with maroctax.dart entry"
git push origin main
```

### Step 4.2 — Port API & logic

Same public surface as TypeScript; use `Decimal` package or fixed-scale integers if needed to avoid float drift.

**Git:**
```bash
git add dart/lib/
git commit -m "feat(dart): port full payroll API and fiscal logic"
git push origin main
```

### Step 4.3 — Dart tests

- `dart test` loads fixtures
- Parity with TS/Java net amounts

**Git:**
```bash
git add dart/test/
git commit -m "test(dart): add fixture-based tests for net salary parity"
git push origin main
```

**Done when:** `dart test` passes; package analyzes clean (`dart analyze`).

---

## Phase 5 — Angular demo (Day 3, part B)

**Goal:** Live salary calculator on GitHub Pages; uses TypeScript `maroctax`.

### Step 5.1 — Angular app scaffold

Suggested layout:
- `demo/` or `typescript/demo/` — Angular 17+ standalone
- Depends on local `maroctax` via `file:` or workspace link

**Git:**
```bash
git add demo/
git commit -m "feat(demo): scaffold Angular 17 standalone salary calculator"
git push origin main
```

### Step 5.2 — Calculator UI

- Inputs: gross slider, dependents selector (0–6)
- Outputs: CNSS, AMO, IR, net, employer cost (live)
- Toggle: “Simulate raise” — second gross input, before/after via `simulateRaise`
- Minimal, accessible styling

**Git:**
```bash
git add demo/
git commit -m "feat(demo): implement live Moroccan salary breakdown UI"
git push origin main
```

### Step 5.3 — GitHub Pages deploy

- `angular.json` → `baseHref` for project pages if needed
- GitHub Actions workflow: build demo, deploy to `gh-pages` branch (or Pages artifact)

**Git:**
```bash
git add .github/workflows/demo-pages.yml demo/
git commit -m "ci: add GitHub Pages workflow for Angular demo"
git push origin main
```

**Done when:** Demo URL works; linked from README (link added in Phase 6).

---

## Phase 6 — Polish, CI & publish (Day 4)

**Goal:** Professional OSS surface; all three packages publishable.

### Step 6.1 — GitHub Actions CI

Workflow (e.g. `.github/workflows/ci.yml`):
- **Job TS:** `npm ci`, `npm test`, `npm run build`
- **Job Java:** `mvn -B test`
- **Job Dart:** `dart pub get`, `dart test`, `dart analyze`

Trigger: `push` + `pull_request` on `main`.

**Git:**
```bash
git add .github/workflows/ci.yml
git commit -m "ci: run TypeScript, Java, and Dart test suites on every push"
git push origin main
```

### Step 6.2 — README

Sections:
- One-sentence description
- Badges: npm, Maven Central, pub.dev, license, CI
- Install: npm / Maven / pub
- Usage examples for all 8 functions × 3 languages
- Fiscal year coverage table (2024, 2025)
- Contributing, link to demo
- MIT badge

**Git:**
```bash
git add README.md
git commit -m "docs: add professional README with install, usage, and badges"
git push origin main
```

### Step 6.3 — CHANGELOG

- `CHANGELOG.md` — v0.1.0, 2025 fiscal rules, initial tri-language release

**Git:**
```bash
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG for v0.1.0 and 2025 fiscal rules"
git push origin main
```

### Step 6.4 — Publish TypeScript (npm)

- `package.json`: `files`, `main`/`exports`, `repository`, `keywords`
- `npm publish --access public` (after version tag)

**Git:**
```bash
git add typescript/package.json
git commit -m "chore(ts): prepare package.json for npm publish"
git push origin main
# Optional tag:
git tag v0.1.0
git push origin v0.1.0
```

### Step 6.5 — Publish Java (Maven Central)

- Sonatype account, `groupId`, GPG signing, `ossrh` staging
- `mvn deploy` per [central.sonatype.com](https://central.sonatype.com) guide

**Git:**
```bash
git add java/pom.xml
git commit -m "chore(java): configure Maven Central deployment metadata"
git push origin main
```

### Step 6.6 — Publish Dart (pub.dev)

- `dart pub publish` — valid `pubspec.yaml`, README, CHANGELOG in package

**Git:**
```bash
git add dart/pubspec.yaml dart/README.md
git commit -m "chore(dart): prepare package for pub.dev publish"
git push origin main
```

**Done when:** CI green; README badges live; packages on npm / Maven Central / pub.dev; demo on Pages.

---

## Phase summary

| Phase | Focus | Key deliverable |
|-------|--------|-----------------|
| 0 | Bootstrap | Git remote, this plan |
| 1 | Skeleton | `fixtures.json`, folder layout |
| 2 | TypeScript | Reference implementation + Jest |
| 3 | Java | BigDecimal port + JUnit |
| 4 | Dart | pub package + tests |
| 5 | Angular | GitHub Pages demo |
| 6 | Polish | CI, README, CHANGELOG, publish |

---

## Git discipline (every step)

```bash
git add <paths>
git commit -m "<type>(<scope>): <short imperative summary>"
git push origin main
```

**Types:** `feat`, `fix`, `test`, `docs`, `chore`, `ci`  
**Scopes:** `ts`, `java`, `dart`, `demo`, repo root

Keep commits small and bisect-friendly — one logical unit per commit.

---

## Risk checkpoints

1. **IR math** — Reconcile annual barème vs monthly withholding; verify all 5 fixtures before porting.
2. **Rounding** — Document per-language rounding (2 decimal places MAD); align Java `BigDecimal` scale with TS/Dart.
3. **Employer rates** — Confirm CNSS/AMO employer shares in `FiscalConfig` (not only employee side).
4. **Overtime / seniority** — Confirm legal multipliers; add config keys so 2026 updates don’t require API changes.

---

## CV bullet (post Phase 6)

> Built and published **maroctax**, an open-source Moroccan payroll engine (Java · TypeScript · Dart) covering IR, CNSS, AMO, overtime, and seniority calculations — published to Maven Central, npm, and pub.dev.

---

*Next action:* Execute **Phase 1** when ready to code (skeleton + `fixtures.json`).
