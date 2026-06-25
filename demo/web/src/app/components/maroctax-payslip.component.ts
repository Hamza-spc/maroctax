import { DecimalPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { SalaryBreakdown, calculateNetSalary } from 'maroctax';

/**
 * Displays a full Moroccan payslip breakdown card for a given gross salary.
 */
@Component({
  selector: 'maroctax-payslip',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <article class="maroctax-payslip">
      <header>
        <h3>Payslip breakdown</h3>
        <p class="subtitle">{{ gross | number: '1.0-0' }} MAD gross · {{ dependents }} dependents</p>
      </header>
      <dl>
        <div><dt>CNSS</dt><dd>-{{ breakdown.cnss | number: '1.2-2' }} MAD</dd></div>
        <div><dt>AMO</dt><dd>-{{ breakdown.amo | number: '1.2-2' }} MAD</dd></div>
        <div><dt>Frais pro</dt><dd>-{{ breakdown.fraisProfessionnels | number: '1.2-2' }} MAD</dd></div>
        <div><dt>IR</dt><dd>-{{ breakdown.ir | number: '1.2-2' }} MAD</dd></div>
        <div class="total"><dt>Net salary</dt><dd>{{ breakdown.net | number: '1.2-2' }} MAD</dd></div>
      </dl>
    </article>
  `,
  styles: [
    `
      .maroctax-payslip {
        font-family: system-ui, sans-serif;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        max-width: 360px;
        background: #fff;
      }
      h3 {
        margin: 0 0 0.25rem;
        font-size: 1.1rem;
      }
      .subtitle {
        margin: 0 0 1rem;
        color: #64748b;
        font-size: 0.875rem;
      }
      dl {
        margin: 0;
      }
      dl > div {
        display: flex;
        justify-content: space-between;
        padding: 0.35rem 0;
        border-bottom: 1px solid #f1f5f9;
      }
      dt {
        color: #475569;
      }
      dd {
        margin: 0;
        font-variant-numeric: tabular-nums;
      }
      .total {
        border-bottom: none;
        padding-top: 0.75rem;
        font-weight: 700;
      }
      .total dd {
        color: #0f766e;
      }
    `,
  ],
})
export class MaroctaxPayslipComponent implements OnChanges {
  /** Monthly gross salary in MAD. */
  @Input({ required: true }) gross!: number;

  /** Number of dependents (0–6). */
  @Input() dependents = 0;

  breakdown: SalaryBreakdown = calculateNetSalary(0, 0);

  ngOnChanges(_changes: SimpleChanges): void {
    this.breakdown = calculateNetSalary(this.gross, this.dependents);
  }
}
