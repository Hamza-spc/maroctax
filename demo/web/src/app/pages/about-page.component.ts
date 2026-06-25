import { Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  standalone: true,
  template: `
    <section class="grid">
      <article class="card">
        <h2>About maroctax</h2>
        <p class="muted">
          A founder-first payroll assistant for Moroccan SMEs and startups. Turn salary expectations
          into hiring budgets, employer costs, and accountant-ready exports — without rebuilding
          payroll math from scratch.
        </p>

        <div class="pill-row">
          <span class="pill">Rules version: 2025 v1.0.0</span>
          <span class="pill">Engine: maroctax 1.0.0</span>
        </div>
      </article>

      <article class="card">
        <h3>What this helps you do</h3>
        <ul class="list">
          <li><strong>Offer builder</strong> — convert a candidate's target net into a gross offer + employer cost</li>
          <li><strong>Team planner</strong> — forecast monthly payroll as you add hires over time</li>
          <li><strong>Exports</strong> — CSV monthly summary and PDF payslip estimates for your accountant</li>
        </ul>
      </article>

      <article class="card">
        <h3>Rules included (2025)</h3>
        <ul class="list">
          <li>SMIG: 3 500 MAD/month</li>
          <li>CNSS employee: 4.48% (cap 6 000 MAD/month)</li>
          <li>AMO employee: 2.26% (no cap)</li>
          <li>Frais professionnels: 20% of (gross − CNSS − AMO), cap 2 500 MAD/month</li>
          <li>IR: LF 2025 progressive barème (0% → 37%)</li>
          <li>Dependents: 500 MAD/year deduction per dependent (max 6)</li>
          <li>Employer cost: CNSS patronale, accident du travail, AMO patronale, taxe de formation</li>
        </ul>
        <p class="muted small">
          2024 is selectable in the UI but currently uses the same parameters as 2025.
        </p>
      </article>

      <article class="card">
        <h3>Sources & references</h3>
        <ul class="list links-list">
          <li>
            <a href="https://www.finances.gov.ma/" target="_blank" rel="noopener">Ministère de l'Économie et des Finances</a>
            — fiscal policy and Loi de Finances
          </li>
          <li>
            <a href="https://www.cnss.ma/" target="_blank" rel="noopener">CNSS</a>
            — social security contributions
          </li>
          <li>
            <a href="https://github.com/Hamza-spc/maroctax" target="_blank" rel="noopener">maroctax on GitHub</a>
            — open-source engine, fixtures, and fiscal config
          </li>
        </ul>
      </article>

      <article class="card warn">
        <h3>Scope & limitations</h3>
        <ul class="list">
          <li><strong>Not official</strong> — not published or certified by DGI, CNSS, or any government body</li>
          <li><strong>Not legal or tax advice</strong> — estimates for planning; validate with a comptable before payroll</li>
          <li><strong>Simplified model</strong> — standard salaried employee; does not cover all real cases</li>
        </ul>
        <p class="muted small">Not included: CIMR, mutuelle, bonuses/indemnities, exemptions, sector-specific regimes, filings, leave/attendance, multi-company admin.</p>
      </article>
    </section>
  `,
  styleUrls: ['../ui/ui-card.css'],
})
export class AboutPageComponent {}
