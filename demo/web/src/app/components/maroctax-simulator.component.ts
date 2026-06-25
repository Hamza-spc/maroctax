import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EmployerCostBreakdown,
  RaiseSimulation,
  SalaryBreakdown,
  calculateEmployerCost,
  calculateNetSalary,
  simulateRaise,
} from 'maroctax';

/**
 * Interactive salary simulator with dependents selector and optional raise comparison.
 */
@Component({
  selector: 'maroctax-simulator',
  standalone: true,
  imports: [FormsModule, DecimalPipe, NgFor, NgIf],
  template: `
    <section class="maroctax-simulator">
      <h3>Salary simulator</h3>

      <label>
        Gross salary (MAD)
        <input type="range" min="3500" max="30000" step="100" [(ngModel)]="gross" (ngModelChange)="recalculate()" />
        <span>{{ gross | number: '1.0-0' }} MAD</span>
      </label>

      <label>
        Dependents
        <select [(ngModel)]="dependents" (ngModelChange)="recalculate()">
          <option *ngFor="let d of dependentOptions" [ngValue]="d">{{ d }}</option>
        </select>
      </label>

      <label class="toggle">
        <input type="checkbox" [(ngModel)]="raiseMode" (ngModelChange)="recalculate()" />
        Simulate raise
      </label>

      <ng-container *ngIf="raiseMode">
        <label>
          New gross (MAD)
          <input type="range" min="3500" max="30000" step="100" [(ngModel)]="newGross" (ngModelChange)="recalculate()" />
          <span>{{ newGross | number: '1.0-0' }} MAD</span>
        </label>
      </ng-container>

      <dl>
        <div><dt>CNSS</dt><dd>{{ breakdown.cnss | number: '1.2-2' }}</dd></div>
        <div><dt>AMO</dt><dd>{{ breakdown.amo | number: '1.2-2' }}</dd></div>
        <div><dt>IR</dt><dd>{{ breakdown.ir | number: '1.2-2' }}</dd></div>
        <div><dt>Net</dt><dd class="highlight">{{ breakdown.net | number: '1.2-2' }} MAD</dd></div>
        <div><dt>Employer cost</dt><dd>{{ employer.totalCost | number: '1.2-2' }} MAD</dd></div>
      </dl>

      <p *ngIf="raiseMode && raise" class="raise-delta">
        Raise net delta: <strong>+{{ raise.deltaNet | number: '1.2-2' }} MAD</strong>
      </p>
    </section>
  `,
  styles: [
    `
      .maroctax-simulator {
        font-family: system-ui, sans-serif;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        max-width: 400px;
        background: #fafafa;
      }
      h3 {
        margin-top: 0;
      }
      label {
        display: block;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #334155;
      }
      input[type='range'] {
        width: 100%;
        display: block;
        margin: 0.5rem 0;
      }
      select {
        display: block;
        margin-top: 0.35rem;
        width: 100%;
        padding: 0.35rem;
      }
      .toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      dl {
        margin: 0;
      }
      dl > div {
        display: flex;
        justify-content: space-between;
        padding: 0.35rem 0;
      }
      .highlight {
        color: #0f766e;
        font-weight: 700;
      }
      .raise-delta {
        margin-top: 1rem;
        padding: 0.75rem;
        background: #ecfdf5;
        border-radius: 8px;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class MaroctaxSimulatorComponent implements OnInit {
  readonly dependentOptions = [0, 1, 2, 3, 4, 5, 6];

  gross = 8000;
  newGross = 10000;
  dependents = 0;
  raiseMode = false;

  breakdown: SalaryBreakdown = calculateNetSalary(8000, 0);
  employer: EmployerCostBreakdown = calculateEmployerCost(8000);
  raise: RaiseSimulation | null = null;

  ngOnInit(): void {
    this.recalculate();
  }

  recalculate(): void {
    this.breakdown = calculateNetSalary(this.gross, this.dependents);
    this.employer = calculateEmployerCost(this.gross);
    this.raise = this.raiseMode
      ? simulateRaise(this.gross, this.newGross, this.dependents)
      : null;
  }
}
