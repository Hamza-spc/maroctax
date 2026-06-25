# maroctax — Implementation Plan

> Moroccan payroll **ecosystem** — core engine in 3 languages, framework integrations, live demo, public REST API, automated CI/CD publishing  
> Repo: [https://github.com/Hamza-spc/maroctax](https://github.com/Hamza-spc/maroctax)

## Mental model

Don't ship "a library." Ship an **ecosystem**:

| Layer | What it is |
|-------|------------|
| **Core** | `maroctax` engine in TypeScript, Java, Dart — same fiscal logic, same fixtures |
| **Tier 1 — Integrations** | Drop-in Spring Boot starter, Angular component library, Flutter widget package |
| **Tier 2 — Product** | Live demo web app recruiters click; public REST API any language can call |
| **Tier 3 — DevOps** | CI on every push; one `git tag v1.0.1` → all registries publish automatically |

Each step ends with **test → git add → commit → push**. After every phase, run the **phase gate** checklist before starting the next phase.

### Testing discipline

| When | What to run |
|------|-------------|
| **After every step** | Step-specific verification (unit tests, build, lint, or structural checks — see each step) |
| **After every phase** | Full phase gate: all step checks + integration smoke test for that phase |
| **Before next phase** | Phase gate must be green — do not proceed if it fails |

---

## Target monorepo layout (end state)

```
maroctax/
├── java/
│   ├── maroctax-core/                  # Maven: core engine (MarocTax)
│   ├── maroctax-spring-boot-starter/   # Tier 1: auto-config + MarocTaxService bean
│   └── maroctax-api/                   # Tier 2: Spring Boot REST API
├── typescript/
│   └── maroctax/                       # npm: core engine
├── angular/
│   └── maroctax-angular/               # Tier 1: npm lib — <maroctax-payslip>, <maroctax-simulator>
├── dart/
│   ├── maroctax/                       # pub.dev: core engine
│   └── maroctax_flutter/               # Tier 1: payslip card + simulator screen widgets
├── demo/
│   └── web/                            # Tier 2: Angular app (GitHub Pages / Vercel)
├── tests/
│   └── fixtures.json                   # Single source of truth — all langs + API contract tests
├── .github/workflows/
│   ├── ci.yml                          # Tier 3: test all suites on push/PR
│   ├── release.yml                     # Tier 3: tag → publish npm/Maven/pub.dev
│   └── demo-pages.yml                  # Tier 2: deploy demo
├── README.md
├── CHANGELOG.md
├── LICENSE
└── IMPLEMENTATION_PLAN.md
```

---

## Phase 0 — Repository bootstrap ✅

**Goal:** Local workspace matches GitHub; planning doc is tracked.

| Step | Action | Details |
|------|--------|---------|
| 0.1 | Clone / init remote | `git init`, `git remote add origin https://github.com/Hamza-spc/maroctax.git`, `git pull origin main` |
| 0.2 | Add this plan | Commit `IMPLEMENTATION_PLAN.md` |

**Done when:** `main` contains README, LICENSE, and this plan.

---

## Phase 1 — Project skeleton & shared fixtures

**Goal:** Monorepo layout (including future integration folders) and shared test fixtures.

### Step 1.1 — Folder skeleton

Create empty package roots (`.gitkeep` where needed):

```
maroctax/
├── java/maroctax-core/
├── java/maroctax-spring-boot-starter/
├── java/maroctax-api/
├── typescript/maroctax/
├── angular/maroctax-angular/
├── dart/maroctax/
├── dart/maroctax_flutter/
├── demo/web/
└── tests/
```

**Test (step 1.1):**
```bash
# All package roots must exist
test -d java/maroctax-core && test -d java/maroctax-spring-boot-starter && \
test -d java/maroctax-api && test -d typescript/maroctax && \
test -d angular/maroctax-angular && test -d dart/maroctax && \
test -d dart/maroctax_flutter && test -d demo/web && test -d tests
```

**Git:**
```bash
git add java/ typescript/ angular/ dart/ demo/ tests/
git commit -m "chore: add monorepo skeleton for core, integrations, demo, and API"
git push origin main
```

### Step 1.2 — `fixtures.json`

Single source of truth for cross-language parity **and** REST API contract tests.

```json
[
  { "gross": 3500,  "dependents": 0, "expectedNet": 3241.10 },
  { "gross": 5000,  "dependents": 1, "expectedNet": 4523.80 },
  { "gross": 8000,  "dependents": 2, "expectedNet": 6891.40 },
  { "gross": 10000, "dependents": 0, "expectedNet": 8405.20 },
  { "gross": 20000, "dependents": 3, "expectedNet": 15632.00 }
]
```

**Test (step 1.2):**
```bash
# Valid JSON, exactly 5 cases, required fields present
python3 -c "
import json, sys
with open('tests/fixtures.json') as f:
    data = json.load(f)
assert len(data) == 5, f'expected 5 fixtures, got {len(data)}'
for i, row in enumerate(data):
    for key in ('gross', 'dependents', 'expectedNet'):
        assert key in row, f'fixture {i} missing {key}'
print('fixtures.json OK:', len(data), 'cases')
"
```

**Git:**
```bash
git add tests/fixtures.json
git commit -m "test: add shared payroll fixtures for cross-language and API parity"
git push origin main
```

### Phase 1 gate (run before Phase 2)

```bash
# 1. Skeleton dirs
test -d java/maroctax-core && test -d typescript/maroctax && test -d dart/maroctax && \
test -d angular/maroctax-angular && test -d demo/web

# 2. Fixtures valid
python3 -c "import json; json.load(open('tests/fixtures.json')); print('phase 1 gate: PASS')"
```

**Done when:** Skeleton exists; fixtures committed and validated; phase gate green; no engine code yet.

---

## Phase 2 — TypeScript core (Day 1)

**Goal:** Reference implementation — fastest iteration, verify math here first, then port.

### Fiscal rules (2025 — encode in `FiscalConfig`)

| Rule | Value |
|------|-------|
| CNSS employee | 4.48% of gross, cap 6 000 MAD/month |
| AMO employee | 2.26% of gross, no cap |
| Frais professionnels | 20% of `(gross - CNSS - AMO)` |
| IR barème (annual) | 0–40k @ 0%; 40 001–60k @ 10% (−4 000); 60 001–80k @ 20% (−10 000); 80 001–100k @ 30% (−18 000); 100 001–180k @ 34% (−22 000); >180k @ 37% (−27 400) |
| Dependents | 500 MAD/year each, max 6 |
| SMIG 2025 | 3 500 MAD/month |

### Step 2.1 — Package scaffold (`typescript/maroctax/`)

- `package.json` — name: `maroctax`, MIT, build/test scripts
- `tsconfig.json`, `src/index.ts`, `src/fiscal-config.ts`, `src/types.ts`

**Git:**
```bash
git add typescript/maroctax/
git commit -m "feat(ts): scaffold maroctax core npm package with FiscalConfig and types"
git push origin main
```

### Step 2.2 — Core deductions & IR

Modules: `cnss.ts`, `amo.ts`, `frais-professionnels.ts`, `ir.ts`  
`calculateNetSalary(gross, dependents, year)` → full breakdown object.

**Review checkpoint:** IR annual → monthly; manually verify all 5 fixtures before porting.

**Git:**
```bash
git add typescript/maroctax/src/
git commit -m "feat(ts): implement CNSS, AMO, frais pro, and IR barème calculation"
git push origin main
```

### Step 2.3 — Remaining public API

| Function | Behavior |
|----------|----------|
| `calculateEmployerCost(gross)` | Total employer cost (gross + employer CNSS/AMO) |
| `reverseFromNet(targetNet, dependents)` | Gross that yields target net |
| `simulateRaise(currentGross, newGross, dependents)` | Before/after + delta |
| `checkSMIG(gross)` | `gross >= smig` for year |
| `calculateOvertime(hourlyRate, hours, type)` | `'day'` \| `'night'` \| `'holiday'` |
| `calculateSeniority(grossSalary, yearsOfService)` | Seniority bonus amount |
| `generatePayslip(employeeInfo, gross, dependents)` | Structured payslip |

JSDoc on every exported function. Export all from `index.ts`.

**Git:**
```bash
git add typescript/maroctax/src/
git commit -m "feat(ts): add employer cost, reverse net, raise sim, SMIG, overtime, seniority, payslip"
git push origin main
```

### Step 2.4 — Jest tests

Load `../../../tests/fixtures.json` — one test per fixture for `calculateNetSalary`; smoke tests for other functions.

**Git:**
```bash
git add typescript/maroctax/
git commit -m "test(ts): add Jest suite against shared fixtures"
git push origin main
```

### Step 2.5 — Build verify

`npm test` + `npm run build` green.

**Git:**
```bash
git add typescript/maroctax/
git commit -m "chore(ts): configure build output and verify all tests pass"
git push origin main
```

**Done when:** TypeScript is the reference; fixtures pass; API frozen for ports and integrations.

### Phase 2 gate (run before Phase 3)

```bash
cd typescript/maroctax && npm run build && npm test
```

**Git (after gate passes):** step 2.5 commit.

---

## Phase 3 — Java core (Day 2, morning)

**Goal:** Java 21 Maven module `maroctax-core` — `BigDecimal` only, no `double` for money.

### Step 3.1 — Maven scaffold (`java/maroctax-core/`)

- `pom.xml` — Java 21, JUnit 5
- `MarocTax` — static methods entry point
- `FiscalConfig`, records: `SalaryResult`, `PayslipResult`, etc.

**Git:**
```bash
git add java/maroctax-core/
git commit -m "feat(java): scaffold maroctax-core Maven module with MarocTax and FiscalConfig"
git push origin main
```

### Step 3.2 — Port fiscal logic

Mirror TypeScript. `RoundingMode` and scale documented (2 decimal MAD).

**Git:**
```bash
git add java/maroctax-core/src/main/
git commit -m "feat(java): port Moroccan payroll logic with BigDecimal"
git push origin main
```

### Step 3.3 — JUnit 5 + fixtures

Assert `expectedNet` within 0.01 MAD for all fixtures.

**Git:**
```bash
git add java/maroctax-core/src/test/
git commit -m "test(java): add JUnit tests matching TypeScript fixtures"
git push origin main
```

### Step 3.4 — `mvn test` green

**Git:**
```bash
git add java/maroctax-core/
git commit -m "chore(java): verify maroctax-core mvn test passes"
git push origin main
```

**Done when:** Java core matches TypeScript for all fixtures.

---

## Phase 4 — Dart core (Day 2–3)

**Goal:** pub.dev-ready `dart/maroctax/` — works in Flutter and pure Dart.

### Step 4.1 — Package scaffold

- `pubspec.yaml`, `lib/maroctax.dart`
- Split: `lib/src/ir.dart`, `cnss.dart`, `amo.dart`, `payslip.dart`, `fiscal_config.dart`

**Git:**
```bash
git add dart/maroctax/
git commit -m "feat(dart): scaffold maroctax core pub package"
git push origin main
```

### Step 4.2 — Port API & logic

Same public surface as TypeScript; avoid float drift (`Decimal` package or fixed-scale ints).

**Git:**
```bash
git add dart/maroctax/lib/
git commit -m "feat(dart): port full payroll API and fiscal logic"
git push origin main
```

### Step 4.3 — Dart tests

`dart test` against fixtures; `dart analyze` clean.

**Git:**
```bash
git add dart/maroctax/test/
git commit -m "test(dart): add fixture-based tests for net salary parity"
git push origin main
```

**Done when:** Dart core matches TypeScript for all fixtures.

---

## Phase 5 — Tier 1: Framework integrations (Day 3)

**Goal:** Easy wins — drop-in beans, components, and widgets that wrap the core engines.

### Step 5.1 — `maroctax-spring-boot-starter` (`java/maroctax-spring-boot-starter/`)

| Piece | Detail |
|-------|--------|
| Dependency | Depends on `maroctax-core` |
| Auto-config | `MarocTaxAutoConfiguration` + `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` |
| Bean | `MarocTaxService` — injectable, wraps `MarocTax` static API |
| Properties | `maroctax.default-year=2025` (optional) |
| Test | `@SpringBootTest` smoke: bean present, `calculateNetSalary` matches fixture |

**Usage target:**
```xml
<dependency>
  <groupId>ma.maroctax</groupId>
  <artifactId>maroctax-spring-boot-starter</artifactId>
</dependency>
```
```java
@Autowired MarocTaxService marocTax;
```

**Git:**
```bash
git add java/maroctax-spring-boot-starter/
git commit -m "feat(spring): add maroctax-spring-boot-starter with MarocTaxService auto-config"
git push origin main
```

### Step 5.2 — `maroctax-angular` (`angular/maroctax-angular/`)

| Piece | Detail |
|-------|--------|
| Package | npm `@maroctax/angular` or `maroctax-angular` |
| Peer deps | Angular 17+, depends on `maroctax` TS core |
| Components | `<maroctax-payslip [gross] [dependents]>` — full breakdown card |
| | `<maroctax-simulator>` — slider + dependents + raise toggle (uses `simulateRaise`) |
| Build | `ng-packagr` library project |
| Test | Component tests with fixture inputs |

**Git:**
```bash
git add angular/maroctax-angular/
git commit -m "feat(angular): add maroctax-angular lib with payslip and simulator components"
git push origin main
```

### Step 5.3 — `maroctax_flutter` (`dart/maroctax_flutter/`)

| Piece | Detail |
|-------|--------|
| Dependency | `maroctax` Dart core |
| Widgets | `MarocTaxPayslipCard` — styled payslip breakdown |
| | `MarocTaxSimulatorScreen` — full screen salary simulator |
| Platform | Flutter only (pure Dart core stays separate) |
| Test | Widget tests with fixture gross/dependents |

**Git:**
```bash
git add dart/maroctax_flutter/
git commit -m "feat(flutter): add maroctax_flutter widgets for payslip and simulator"
git push origin main
```

**Done when:** Spring app gets a bean with one dependency; Angular/Flutter apps render payslip from package imports.

---

## Phase 6 — Tier 2: Product layer (Day 3–4)

**Goal:** Things recruiters and devs actually click — live UI and a callable API.

### Step 6.1 — Live demo web app (`demo/web/`)

| Piece | Detail |
|-------|--------|
| Stack | Angular 17+ standalone app |
| Deps | `maroctax` (TS core) + `maroctax-angular` components |
| UX | Gross slider, dependents 0–6, live CNSS/AMO/IR/net/employer cost |
| Extra | Full payslip view via `<maroctax-payslip>`; raise sim toggle |
| Polish | Clean minimal UI, mobile-friendly, link to GitHub + API docs |
| Deploy | GitHub Pages **or** Vercel (document chosen URL in README) |

**Git (scaffold):**
```bash
git add demo/web/
git commit -m "feat(demo): scaffold Angular demo app using maroctax and maroctax-angular"
git push origin main
```

**Git (UI complete):**
```bash
git add demo/web/
git commit -m "feat(demo): implement live salary calculator and payslip view"
git push origin main
```

**Git (deploy workflow):**
```bash
git add .github/workflows/demo-pages.yml demo/web/
git commit -m "ci: add GitHub Pages workflow for live demo"
git push origin main
```

### Step 6.2 — REST API (`java/maroctax-api/`)

| Piece | Detail |
|-------|--------|
| Stack | Spring Boot 3, uses `maroctax-spring-boot-starter` |
| Endpoints | `POST /api/v1/net-salary` — `{ gross, dependents, year? }` |
| | `POST /api/v1/employer-cost` — `{ gross }` |
| | `POST /api/v1/reverse-net` — `{ targetNet, dependents }` |
| | `POST /api/v1/simulate-raise` — `{ currentGross, newGross, dependents }` |
| | `POST /api/v1/payslip` — `{ employeeInfo, gross, dependents }` |
| | `GET /api/v1/health` |
| Docs | OpenAPI / Swagger UI at `/swagger-ui.html` |
| Tests | `@WebMvcTest` or MockMvc — responses match fixtures |
| Deploy | Railway or Render (free tier); optional custom domain `api.maroctax.ma` |

**Git (scaffold):**
```bash
git add java/maroctax-api/
git commit -m "feat(api): scaffold Spring Boot REST API for maroctax"
git push origin main
```

**Git (endpoints + OpenAPI):**
```bash
git add java/maroctax-api/
git commit -m "feat(api): expose payroll endpoints with OpenAPI documentation"
git push origin main
```

**Git (contract tests):**
```bash
git add java/maroctax-api/src/test/
git commit -m "test(api): add fixture-based contract tests for REST endpoints"
git push origin main
```

**Git (deploy config — optional):**
```bash
git add java/maroctax-api/Dockerfile java/maroctax-api/render.yaml
git commit -m "chore(api): add Docker and Render deployment config"
git push origin main
```

**Done when:** Demo URL live in README; API returns fixture-accurate JSON; Swagger documents all endpoints.

---

## Phase 7 — Tier 3: CI/CD, polish & publish (Day 4)

**Goal:** Real DevOps maturity — test everything on push; one tag publishes everything.

### Step 7.1 — CI on every push (`.github/workflows/ci.yml`)

Parallel jobs:

| Job | Commands |
|-----|----------|
| `typescript` | `npm ci && npm test && npm run build` in `typescript/maroctax/` |
| `java-core` | `mvn -B test` in `java/maroctax-core/` |
| `java-starter` | `mvn -B test` in `java/maroctax-spring-boot-starter/` |
| `java-api` | `mvn -B test` in `java/maroctax-api/` |
| `dart-core` | `dart pub get && dart test && dart analyze` in `dart/maroctax/` |
| `flutter` | `flutter test` in `dart/maroctax_flutter/` |
| `angular-lib` | `npm test && npm run build` in `angular/maroctax-angular/` |
| `demo` | `npm run build` in `demo/web/` |

Trigger: `push` + `pull_request` on `main`.

**Git:**
```bash
git add .github/workflows/ci.yml
git commit -m "ci: run all core, integration, API, and demo test suites on push"
git push origin main
```

### Step 7.2 — Release automation (`.github/workflows/release.yml`)

Trigger: `push` tag matching `v*.*.*`

| Step | Action |
|------|--------|
| 1 | Run full CI test matrix |
| 2 | Publish `maroctax` → npm |
| 3 | Publish `maroctax-angular` → npm |
| 4 | Deploy `maroctax-core` + `maroctax-spring-boot-starter` → Maven Central |
| 5 | Publish `maroctax` + `maroctax_flutter` → pub.dev |
| 6 | Build & deploy demo to GitHub Pages |
| 7 | Create GitHub Release with CHANGELOG excerpt |

**Secrets needed:** `NPM_TOKEN`, `OSSRH_USERNAME`, `OSSRH_PASSWORD`, `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE`, `PUB_CREDENTIALS`

**Git:**
```bash
git add .github/workflows/release.yml
git commit -m "ci: add release workflow to publish all packages on version tag"
git push origin main
```

**First release:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Step 7.3 — README (ecosystem positioning)

Sections:
- One-liner: *Moroccan payroll ecosystem — engine, integrations, demo, API*
- Architecture diagram (core → integrations → demo/API)
- Badges: npm (core + angular), Maven Central (core + starter), pub.dev (core + flutter), CI, license, demo link, API link
- Install tables per package
- Usage examples: core 8 functions × 3 langs + Spring bean + Angular component + Flutter widget + `curl` API example
- Fiscal year coverage table (2024, 2025)
- Contributing guide

**Git:**
```bash
git add README.md
git commit -m "docs: add ecosystem README with install, usage, demo, and API links"
git push origin main
```

### Step 7.4 — CHANGELOG

`CHANGELOG.md` — v1.0.0: 2025 fiscal rules, tri-language core, Spring/Angular/Flutter integrations, REST API, demo.

**Git:**
```bash
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG for v1.0.0 ecosystem release"
git push origin main
```

### Step 7.5 — Manual publish prep (one-time)

Before first automated release, configure registries:

| Package | Registry | One-time setup |
|---------|----------|----------------|
| `maroctax` | npm | `npm publish --access public` |
| `maroctax-angular` | npm | scoped or unscoped publish |
| `maroctax-core` | Maven Central | Sonatype OSSRH + GPG |
| `maroctax-spring-boot-starter` | Maven Central | same `groupId` |
| `maroctax` | pub.dev | `dart pub publish` |
| `maroctax_flutter` | pub.dev | `dart pub publish` |

**Git (version metadata):**
```bash
git add typescript/maroctax/package.json angular/maroctax-angular/package.json java/*/pom.xml dart/*/pubspec.yaml
git commit -m "chore: align version metadata across all publishable packages"
git push origin main
```

**Done when:** CI green on `main`; `v1.0.0` tag triggers full publish; README links demo + API; all badges live.

---

## Phase summary

| Phase | Tier | Focus | Key deliverable |
|-------|------|--------|-----------------|
| 0 | — | Bootstrap | Git remote, this plan ✅ |
| 1 | — | Skeleton | Fixtures + full folder layout |
| 2 | Core | TypeScript | Reference engine + Jest |
| 3 | Core | Java | `maroctax-core` + JUnit |
| 4 | Core | Dart | `maroctax` pub package + tests |
| 5 | **Tier 1** | Integrations | Spring starter, Angular lib, Flutter widgets |
| 6 | **Tier 2** | Product | Live demo + REST API |
| 7 | **Tier 3** | DevOps | CI, release automation, README, publish |

### Suggested day mapping (extend original 4-day window)

| Day | Phases | Hours focus |
|-----|--------|-------------|
| Day 1 | 1 + 2 | Fixtures, TS core, verify IR math |
| Day 2 | 3 + 4 | Java + Dart cores |
| Day 3 | 5 + 6.1 | Integrations + demo app |
| Day 4 | 6.2 + 7 | API, CI/CD, README, first release tag |

---

## Git discipline (every step)

```bash
git add <paths>
git commit -m "<type>(<scope>): <short imperative summary>"
git push origin main
```

**Types:** `feat`, `fix`, `test`, `docs`, `chore`, `ci`  
**Scopes:** `ts`, `java`, `spring`, `api`, `dart`, `flutter`, `angular`, `demo`

Keep commits small and bisect-friendly — one logical unit per commit.

---

## Risk checkpoints

1. **IR math** — Verify all 5 fixtures in TypeScript before any port or API work.
2. **Rounding** — Align TS / Java `BigDecimal` / Dart to 2 decimal MAD; document in README.
3. **Employer rates** — Employer CNSS/AMO in `FiscalConfig`, not just employee side.
4. **API contract** — REST JSON field names stable; version under `/api/v1/`.
5. **Monorepo versions** — Single version bump across all packages on release (e.g. all `1.0.0`).
6. **Angular lib boundary** — `maroctax-angular` wraps core; demo app must not duplicate calculation logic.

---

## CV bullets (post Phase 7)

**Primary:**
> Built and published **maroctax**, an open-source Moroccan payroll ecosystem — tri-language core engine (Java · TypeScript · Dart), Spring Boot starter, Angular component library, Flutter widgets, live demo, public REST API, and tag-triggered CI/CD publishing to npm, Maven Central, and pub.dev.

**Short:**
> Open-sourced a Moroccan payroll engine with framework integrations (Spring Boot / Angular / Flutter), a public API, and automated multi-registry releases.

---

*Next action:* Execute **Phase 1** (skeleton + `fixtures.json`).
