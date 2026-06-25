import { Component } from '@angular/core';
import { MaroctaxPayslipComponent } from './components/maroctax-payslip.component';
import { MaroctaxSimulatorComponent } from './components/maroctax-simulator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MaroctaxPayslipComponent, MaroctaxSimulatorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly githubUrl = 'https://github.com/Hamza-spc/maroctax';
  readonly apiDocsHint = 'Run the maroctax-api Spring Boot app locally for Swagger at /swagger-ui.html';
}
