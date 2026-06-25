package ma.maroctax.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import ma.maroctax.FiscalYear;
import ma.maroctax.api.dto.EmployerCostRequest;
import ma.maroctax.api.dto.HealthResponse;
import ma.maroctax.api.dto.NetSalaryRequest;
import ma.maroctax.api.dto.PayslipRequest;
import ma.maroctax.api.dto.ReverseNetRequest;
import ma.maroctax.api.dto.SimulateRaiseRequest;
import ma.maroctax.spring.MarocTaxService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Payroll", description = "Moroccan payroll calculation API")
public class PayrollController {

  private final MarocTaxService marocTaxService;

  public PayrollController(MarocTaxService marocTaxService) {
    this.marocTaxService = marocTaxService;
  }

  @GetMapping("/health")
  @Operation(summary = "Health check")
  public HealthResponse health() {
    return HealthResponse.ok();
  }

  @PostMapping("/net-salary")
  @Operation(summary = "Calculate net salary with full breakdown")
  public ResponseEntity<?> netSalary(@RequestBody NetSalaryRequest request) {
    var year = resolveYear(request.year());
    var result =
        year == null
            ? marocTaxService.calculateNetSalary(request.gross(), request.dependents())
            : marocTaxService.calculateNetSalary(request.gross(), request.dependents(), year);
    return ResponseEntity.ok(result);
  }

  @PostMapping("/employer-cost")
  @Operation(summary = "Calculate total employer cost")
  public ResponseEntity<?> employerCost(@RequestBody EmployerCostRequest request) {
    var year = resolveYear(request.year());
    var result =
        year == null
            ? marocTaxService.calculateEmployerCost(request.gross())
            : ma.maroctax.MarocTax.calculateEmployerCost(request.gross(), year);
    return ResponseEntity.ok(result);
  }

  @PostMapping("/reverse-net")
  @Operation(summary = "Find gross salary for a target net")
  public ResponseEntity<?> reverseNet(@RequestBody ReverseNetRequest request) {
    var year = resolveYear(request.year());
    BigDecimal gross =
        year == null
            ? marocTaxService.reverseFromNet(request.targetNet(), request.dependents())
            : ma.maroctax.MarocTax.reverseFromNet(request.targetNet(), request.dependents(), year);
    return ResponseEntity.ok(java.util.Map.of("gross", gross));
  }

  @PostMapping("/simulate-raise")
  @Operation(summary = "Compare salary before and after a raise")
  public ResponseEntity<?> simulateRaise(@RequestBody SimulateRaiseRequest request) {
    var year = resolveYear(request.year());
    var result =
        year == null
            ? marocTaxService.simulateRaise(
                request.currentGross(), request.newGross(), request.dependents())
            : ma.maroctax.MarocTax.simulateRaise(
                request.currentGross(), request.newGross(), request.dependents(), year);
    return ResponseEntity.ok(result);
  }

  @PostMapping("/payslip")
  @Operation(summary = "Generate a structured payslip")
  public ResponseEntity<?> payslip(@RequestBody PayslipRequest request) {
    var year = resolveYear(request.year());
    int month = request.month() == null ? java.time.LocalDate.now().getMonthValue() : request.month();
    var result =
        year == null
            ? marocTaxService.generatePayslip(
                request.employeeInfo(), request.gross(), request.dependents(), month)
            : ma.maroctax.MarocTax.generatePayslip(
                request.employeeInfo(), request.gross(), request.dependents(), year, month);
    return ResponseEntity.ok(result);
  }

  private FiscalYear resolveYear(Integer year) {
    return year == null ? null : FiscalYear.of(year);
  }
}
