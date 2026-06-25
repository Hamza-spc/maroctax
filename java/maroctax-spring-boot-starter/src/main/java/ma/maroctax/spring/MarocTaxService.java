package ma.maroctax.spring;

import java.math.BigDecimal;
import ma.maroctax.EmployeeInfo;
import ma.maroctax.EmployerCostResult;
import ma.maroctax.FiscalYear;
import ma.maroctax.MarocTax;
import ma.maroctax.OvertimeType;
import ma.maroctax.PayslipResult;
import ma.maroctax.RaiseSimulationResult;
import ma.maroctax.SalaryResult;

/**
 * Injectable payroll service wrapping the {@link MarocTax} engine.
 *
 * <p>Uses {@link MarocTaxProperties#getDefaultYear()} when a year is not passed explicitly.
 */
public class MarocTaxService {

  private final MarocTaxProperties properties;

  public MarocTaxService(MarocTaxProperties properties) {
    this.properties = properties;
  }

  public SalaryResult calculateNetSalary(BigDecimal gross, int dependents) {
    return MarocTax.calculateNetSalary(gross, dependents, defaultYear());
  }

  public SalaryResult calculateNetSalary(BigDecimal gross, int dependents, FiscalYear year) {
    return MarocTax.calculateNetSalary(gross, dependents, year);
  }

  public EmployerCostResult calculateEmployerCost(BigDecimal gross) {
    return MarocTax.calculateEmployerCost(gross, defaultYear());
  }

  public BigDecimal reverseFromNet(BigDecimal targetNet, int dependents) {
    return MarocTax.reverseFromNet(targetNet, dependents, defaultYear());
  }

  public RaiseSimulationResult simulateRaise(
      BigDecimal currentGross, BigDecimal newGross, int dependents) {
    return MarocTax.simulateRaise(currentGross, newGross, dependents, defaultYear());
  }

  public boolean checkSmig(BigDecimal gross) {
    return MarocTax.checkSMIG(gross, defaultYear());
  }

  public BigDecimal calculateOvertime(BigDecimal hourlyRate, BigDecimal hours, OvertimeType type) {
    return MarocTax.calculateOvertime(hourlyRate, hours, type, defaultYear());
  }

  public BigDecimal calculateSeniority(BigDecimal grossSalary, int yearsOfService) {
    return MarocTax.calculateSeniority(grossSalary, yearsOfService, defaultYear());
  }

  public PayslipResult generatePayslip(
      EmployeeInfo employeeInfo, BigDecimal gross, int dependents, int month) {
    return MarocTax.generatePayslip(employeeInfo, gross, dependents, defaultYear(), month);
  }

  private FiscalYear defaultYear() {
    return FiscalYear.of(properties.getDefaultYear());
  }
}
