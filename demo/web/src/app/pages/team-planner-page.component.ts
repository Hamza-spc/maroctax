import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { FiscalYear } from 'maroctax';
import type { EmployeePlan, TeamPlan, YearMonth } from '../planner/planner-types';
import { loadPlan, savePlan } from '../planner/planner-storage';
import {
  addMonths,
  clampDependents,
  computeTotalsForMonth,
  cryptoRandomId,
  currentYearMonth,
  parseYearMonth,
} from '../planner/planner-utils';
import { downloadTextFile } from '../exports/export-utils';
import { buildMonthlyPayrollCsv } from '../exports/payroll-csv';
import { downloadPayslipPdf } from '../exports/payslip-pdf';

@Component({
  selector: 'app-team-planner-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, NgIf, NgFor],
  template: `
    <section class="grid">
      <article class="card">
        <div class="row header-row">
          <div>
            <h2>Team planner</h2>
            <p class="muted">
              Plan hiring over time and see monthly payroll totals. Use <strong>gross</strong> or
              <strong>target net</strong> per employee.
            </p>
          </div>
          <span class="pill">MAD / month</span>
        </div>

        <div class="row">
          <div class="field">
            <label>Plan name</label>
            <input [(ngModel)]="plan.name" (ngModelChange)="persist()" />
          </div>

          <div class="field">
            <label>Fiscal year</label>
            <select [(ngModel)]="plan.year" (ngModelChange)="persistAndRecalc()">
              <option [ngValue]="2025">2025</option>
              <option [ngValue]="2024">2024</option>
            </select>
          </div>

          <div class="field">
            <label>Month</label>
            <input type="month" [(ngModel)]="selectedMonth" (ngModelChange)="onMonthChange()" />
            <small>Totals include employees starting on or before this month.</small>
          </div>
        </div>

        <div class="totals">
          <div class="metric">
            <div class="metric-label">Total employer cost</div>
            <div class="metric-value highlight">{{ totals.totalEmployerCost | number: '1.2-2' }} MAD</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total net paid</div>
            <div class="metric-value">{{ totals.totalNet | number: '1.2-2' }} MAD</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total gross</div>
            <div class="metric-value">{{ totals.totalGross | number: '1.2-2' }} MAD</div>
          </div>
        </div>
      </article>

      <article class="card">
        <div class="row header-row">
          <div>
            <h3>Employees</h3>
            <p class="muted">Add roles, start month, and compensation input mode.</p>
          </div>
          <div class="row">
            <button class="btn btn-ghost" type="button" (click)="downloadCsv()">Download CSV</button>
            <button class="btn" type="button" (click)="addEmployee()">+ Add</button>
          </div>
        </div>

        <div class="table">
          <div class="tr th">
            <div>Role</div>
            <div>Start</div>
            <div>Deps</div>
            <div>Mode</div>
            <div>Gross / Target net</div>
            <div>Net</div>
            <div>Employer cost</div>
            <div></div>
          </div>

          <div class="tr" *ngFor="let e of plan.employees; trackBy: trackById">
            <div>
              <input class="in" [(ngModel)]="e.label" (ngModelChange)="persistAndRecalc()" />
            </div>
            <div>
              <input class="in" type="month" [(ngModel)]="e.startMonth" (ngModelChange)="onEmployeeMonthChange(e)" />
            </div>
            <div>
              <input class="in" type="number" min="0" max="6" step="1" [(ngModel)]="e.dependents" (ngModelChange)="onEmployeeDepsChange(e)" />
            </div>
            <div>
              <select class="in" [(ngModel)]="e.inputMode" (ngModelChange)="onEmployeeModeChange(e)">
                <option [ngValue]="'targetNet'">Target net</option>
                <option [ngValue]="'gross'">Gross</option>
              </select>
            </div>
            <div>
              <input
                class="in"
                type="number"
                min="0"
                step="50"
                [ngModel]="e.inputMode === 'gross' ? (e.gross ?? 0) : (e.targetNet ?? 0)"
                (ngModelChange)="onEmployeeAmountChange(e, $event)"
              />
            </div>
            <div class="num">
              <span *ngIf="computedById[e.id] as c">{{ c.breakdown.net | number: '1.2-2' }}</span>
              <span *ngIf="!computedById[e.id]">—</span>
            </div>
            <div class="num">
              <span *ngIf="computedById[e.id] as c">{{ c.employer.totalCost | number: '1.2-2' }}</span>
              <span *ngIf="!computedById[e.id]">—</span>
            </div>
            <div class="actions">
              <button class="btn btn-ghost" type="button" (click)="downloadPdf(e.id)">PDF</button>
              <button class="btn btn-ghost" type="button" (click)="removeEmployee(e.id)">Remove</button>
            </div>
          </div>
        </div>
      </article>

      <article class="card">
        <h3>Next 6 months forecast</h3>
        <p class="muted">Employer cost totals by month (based on start dates).</p>

        <div class="bars">
          <div class="bar" *ngFor="let m of forecastMonths">
            <div class="bar-top">
              <span class="bar-label">{{ m }}</span>
              <span class="bar-value">{{ forecastByMonth[m] | number: '1.0-0' }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="forecastPct(m)"></div>
            </div>
          </div>
        </div>
      </article>
    </section>
  `,
  styleUrls: ['../ui/ui-card.css'],
})
export class TeamPlannerPageComponent {
  plan: TeamPlan;
  selectedMonth: YearMonth = currentYearMonth();

  totals = { month: this.selectedMonth, totalGross: 0, totalNet: 0, totalEmployerCost: 0 };
  computedById: Record<string, { breakdown: any; employer: any }> = {};

  forecastMonths: YearMonth[] = [];
  forecastByMonth: Record<string, number> = {};

  constructor() {
    const year: FiscalYear = 2025;
    this.plan = loadPlan(year);
    this.selectedMonth = currentYearMonth();
    this.recalculate();
  }

  trackById(_index: number, e: EmployeePlan): string {
    return e.id;
  }

  onMonthChange(): void {
    this.selectedMonth = parseYearMonth(this.selectedMonth);
    this.persist();
    this.recalculate();
  }

  onEmployeeMonthChange(e: EmployeePlan): void {
    e.startMonth = parseYearMonth(e.startMonth);
    this.persistAndRecalc();
  }

  onEmployeeDepsChange(e: EmployeePlan): void {
    e.dependents = clampDependents(e.dependents);
    this.persistAndRecalc();
  }

  onEmployeeModeChange(e: EmployeePlan): void {
    if (e.inputMode === 'gross' && e.gross == null) e.gross = 0;
    if (e.inputMode === 'targetNet' && e.targetNet == null) e.targetNet = 0;
    this.persistAndRecalc();
  }

  onEmployeeAmountChange(e: EmployeePlan, value: number): void {
    const n = Number(value ?? 0);
    if (e.inputMode === 'gross') e.gross = n;
    else e.targetNet = n;
    this.persistAndRecalc();
  }

  addEmployee(): void {
    this.plan.employees = [
      ...this.plan.employees,
      {
        id: cryptoRandomId(),
        label: `New hire ${this.plan.employees.length + 1}`,
        dependents: 0,
        startMonth: this.selectedMonth,
        inputMode: 'targetNet',
        targetNet: 8000,
      },
    ];
    this.persistAndRecalc();
  }

  removeEmployee(id: string): void {
    this.plan.employees = this.plan.employees.filter((e) => e.id !== id);
    this.persistAndRecalc();
  }

  persist(): void {
    savePlan(this.plan);
  }

  persistAndRecalc(): void {
    this.persist();
    this.recalculate();
  }

  recalculate(): void {
    const { computedEmployees, totals } = computeTotalsForMonth(this.plan, this.selectedMonth);
    this.totals = totals;
    this.computedById = Object.fromEntries(
      computedEmployees.map((c) => [c.employee.id, { breakdown: c.breakdown, employer: c.employer }]),
    );

    this.forecastMonths = Array.from({ length: 6 }, (_, i) => addMonths(this.selectedMonth, i));
    this.forecastByMonth = Object.fromEntries(
      this.forecastMonths.map((m) => [m, computeTotalsForMonth(this.plan, m).totals.totalEmployerCost]),
    );
  }

  forecastPct(month: YearMonth): number {
    const max = Math.max(...Object.values(this.forecastByMonth), 1);
    const v = this.forecastByMonth[month] ?? 0;
    return Math.round((v / max) * 100);
  }

  downloadCsv(): void {
    const csv = buildMonthlyPayrollCsv(this.plan, this.selectedMonth);
    downloadTextFile(`payroll_${this.selectedMonth}.csv`, csv, 'text/csv');
  }

  async downloadPdf(employeeId: string): Promise<void> {
    const { computedEmployees } = computeTotalsForMonth(this.plan, this.selectedMonth);
    const found = computedEmployees.find((c) => c.employee.id === employeeId);
    if (!found) return;

    await downloadPayslipPdf({
      monthLabel: this.selectedMonth,
      employeeLabel: found.employee.label,
      gross: found.gross,
      dependents: found.employee.dependents,
      breakdown: found.breakdown,
      employer: found.employer,
    });
  }
 }

