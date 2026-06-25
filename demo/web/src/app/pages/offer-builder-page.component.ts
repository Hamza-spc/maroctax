import { DecimalPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EmployerCostBreakdown,
  FiscalYear,
  SalaryBreakdown,
  calculateEmployerCost,
  calculateNetSalary,
  reverseFromNet,
} from 'maroctax';

type InputMode = 'gross' | 'targetNet';

@Component({
  selector: 'app-offer-builder-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, NgIf],
  template: `
    <section class="grid">
      <article class="card">
        <div class="row header-row">
          <div>
            <h2>Offer builder</h2>
            <p class="muted">
              Turn a candidate’s <strong>target net</strong> into a recommended gross offer — and see
              your <strong>all-in employer cost</strong>.
            </p>
          </div>
          <span class="pill">MAD / month</span>
        </div>

        <div class="row">
          <div class="field">
            <label>Fiscal year</label>
            <select [(ngModel)]="year" (ngModelChange)="recalculate()">
              <option [ngValue]="2025">2025</option>
              <option [ngValue]="2024">2024</option>
            </select>
            <small>2024 currently uses the same parameters as 2025 in v1.</small>
          </div>

          <div class="field">
            <label>Dependents</label>
            <select [(ngModel)]="dependents" (ngModelChange)="recalculate()">
              <option *ngFor="let d of dependentOptions" [ngValue]="d">{{ d }}</option>
            </select>
          </div>

          <div class="field">
            <label>Input mode</label>
            <select [(ngModel)]="mode" (ngModelChange)="onModeChange()">
              <option [ngValue]="'targetNet'">Target net (candidate)</option>
              <option [ngValue]="'gross'">Gross (your offer)</option>
            </select>
          </div>
        </div>

        <div class="row" *ngIf="mode === 'targetNet'">
          <div class="field">
            <label>Target net salary</label>
            <input
              type="number"
              min="0"
              step="50"
              [(ngModel)]="targetNet"
              (ngModelChange)="recalculate()"
            />
            <small>We’ll compute the gross that matches this net (approx).</small>
          </div>
        </div>

        <div class="row" *ngIf="mode === 'gross'">
          <div class="field">
            <label>Gross salary</label>
            <input
              type="number"
              min="0"
              step="50"
              [(ngModel)]="gross"
              (ngModelChange)="recalculate()"
            />
            <small>We’ll compute the resulting net + employer cost.</small>
          </div>
        </div>

        <div class="summary">
          <dl class="kv">
            <dt>Recommended gross</dt>
            <dd class="highlight">{{ gross | number: '1.0-0' }} MAD</dd>
          </dl>
          <dl class="kv">
            <dt>Net salary</dt>
            <dd class="highlight">{{ breakdown.net | number: '1.2-2' }} MAD</dd>
          </dl>
          <dl class="kv">
            <dt>Employer cost</dt>
            <dd class="highlight">{{ employer.totalCost | number: '1.2-2' }} MAD</dd>
          </dl>

          <dl class="kv">
            <dt>CNSS (employee)</dt>
            <dd>-{{ breakdown.cnss | number: '1.2-2' }}</dd>
          </dl>
          <dl class="kv">
            <dt>AMO (employee)</dt>
            <dd>-{{ breakdown.amo | number: '1.2-2' }}</dd>
          </dl>
          <dl class="kv">
            <dt>IR</dt>
            <dd>-{{ breakdown.ir | number: '1.2-2' }}</dd>
          </dl>
        </div>
      </article>

      <article class="card">
        <h3>Negotiation levers</h3>
        <p class="muted">
          Move the gross slider to see how net + employer cost change.
        </p>

        <div class="field">
          <label>Gross sensitivity</label>
          <input
            type="range"
            [min]="sensitivityMin"
            [max]="sensitivityMax"
            step="50"
            [(ngModel)]="sensitivityGross"
            (ngModelChange)="recalculateSensitivity()"
          />
          <small>
            {{ sensitivityGross | number: '1.0-0' }} MAD gross
            · Net {{ sensitivityBreakdown.net | number: '1.2-2' }}
            · Employer {{ sensitivityEmployer.totalCost | number: '1.2-2' }}
          </small>
        </div>

        <div class="summary">
          <dl class="kv">
            <dt>Δ net vs recommended</dt>
            <dd [class.highlight]="true">
              {{ (sensitivityBreakdown.net - breakdown.net) | number: '1.2-2' }} MAD
            </dd>
          </dl>
          <dl class="kv">
            <dt>Δ employer cost</dt>
            <dd [class.highlight]="true">
              {{ (sensitivityEmployer.totalCost - employer.totalCost) | number: '1.2-2' }} MAD
            </dd>
          </dl>
        </div>
      </article>
    </section>
  `,
  styleUrls: ['../ui/ui-card.css'],
})
export class OfferBuilderPageComponent {
  readonly dependentOptions = [0, 1, 2, 3, 4, 5, 6];

  year: FiscalYear = 2025;
  dependents = 0;
  mode: InputMode = 'targetNet';

  targetNet = 9000;
  gross = 0;

  breakdown: SalaryBreakdown = calculateNetSalary(0, 0, 2025);
  employer: EmployerCostBreakdown = calculateEmployerCost(0, 2025);

  sensitivityGross = 0;
  sensitivityBreakdown: SalaryBreakdown = calculateNetSalary(0, 0, 2025);
  sensitivityEmployer: EmployerCostBreakdown = calculateEmployerCost(0, 2025);

  sensitivityMin = 3500;
  sensitivityMax = 30000;

  constructor() {
    this.recalculate();
  }

  onModeChange(): void {
    this.recalculate();
  }

  recalculate(): void {
    const dep = this.dependents;
    const year = this.year;

    if (this.mode === 'targetNet') {
      this.gross = reverseFromNet(this.targetNet, dep, year);
    }

    this.breakdown = calculateNetSalary(this.gross, dep, year);
    this.employer = calculateEmployerCost(this.gross, year);

    this.sensitivityMin = Math.max(0, Math.floor((this.gross - 3000) / 50) * 50);
    this.sensitivityMax = Math.ceil((this.gross + 3000) / 50) * 50;
    this.sensitivityGross = this.gross;
    this.recalculateSensitivity();
  }

  recalculateSensitivity(): void {
    const dep = this.dependents;
    const year = this.year;
    this.sensitivityBreakdown = calculateNetSalary(this.sensitivityGross, dep, year);
    this.sensitivityEmployer = calculateEmployerCost(this.sensitivityGross, year);
  }
}

