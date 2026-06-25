package ma.maroctax;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Moroccan payroll calculation engine.
 *
 * <p>All monetary values use {@link BigDecimal} with HALF_UP rounding to 2 decimal places (MAD).
 */
public final class MarocTax {

  private MarocTax() {}

  /**
   * Calculates monthly net salary with a full deduction breakdown.
   *
   * @param gross monthly gross salary in MAD
   * @param dependents number of dependents (max 6)
   * @param year fiscal year
   */
  public static SalaryResult calculateNetSalary(
      BigDecimal gross, int dependents, FiscalYear year) {
    return PayrollEngine.calculateNetSalary(gross, dependents, year);
  }

  /**
   * Calculates monthly net salary with a full deduction breakdown (defaults to 2025).
   *
   * @param gross monthly gross salary in MAD
   * @param dependents number of dependents (max 6)
   */
  public static SalaryResult calculateNetSalary(BigDecimal gross, int dependents) {
    return calculateNetSalary(gross, dependents, FiscalYear.Y2025);
  }

  /**
   * Calculates total employer cost including gross salary and employer contributions.
   *
   * @param gross monthly gross salary in MAD
   * @param year fiscal year
   */
  public static EmployerCostResult calculateEmployerCost(BigDecimal gross, FiscalYear year) {
    return PayrollEngine.calculateEmployerCost(gross, year);
  }

  /**
   * Calculates total employer cost (defaults to 2025).
   *
   * @param gross monthly gross salary in MAD
   */
  public static EmployerCostResult calculateEmployerCost(BigDecimal gross) {
    return calculateEmployerCost(gross, FiscalYear.Y2025);
  }

  /**
   * Finds the gross salary that produces a target net (binary search).
   *
   * @param targetNet desired monthly net salary in MAD
   * @param dependents number of dependents
   * @param year fiscal year
   */
  public static BigDecimal reverseFromNet(
      BigDecimal targetNet, int dependents, FiscalYear year) {
    return PayrollEngine.reverseFromNet(targetNet, dependents, year);
  }

  /**
   * Finds the gross salary that produces a target net (defaults to 2025).
   *
   * @param targetNet desired monthly net salary in MAD
   * @param dependents number of dependents
   */
  public static BigDecimal reverseFromNet(BigDecimal targetNet, int dependents) {
    return reverseFromNet(targetNet, dependents, FiscalYear.Y2025);
  }

  /**
   * Compares net salary before and after a gross raise.
   *
   * @param currentGross current monthly gross in MAD
   * @param newGross proposed monthly gross in MAD
   * @param dependents number of dependents
   * @param year fiscal year
   */
  public static RaiseSimulationResult simulateRaise(
      BigDecimal currentGross, BigDecimal newGross, int dependents, FiscalYear year) {
    return PayrollEngine.simulateRaise(currentGross, newGross, dependents, year);
  }

  /**
   * Compares net salary before and after a gross raise (defaults to 2025).
   */
  public static RaiseSimulationResult simulateRaise(
      BigDecimal currentGross, BigDecimal newGross, int dependents) {
    return simulateRaise(currentGross, newGross, dependents, FiscalYear.Y2025);
  }

  /**
   * Checks whether gross salary meets the legal minimum (SMIG).
   *
   * @param gross monthly gross salary in MAD
   * @param year fiscal year
   */
  public static boolean checkSMIG(BigDecimal gross, FiscalYear year) {
    return PayrollEngine.checkSmig(gross, year);
  }

  /**
   * Checks whether gross salary meets the legal minimum (defaults to 2025).
   */
  public static boolean checkSMIG(BigDecimal gross) {
    return checkSMIG(gross, FiscalYear.Y2025);
  }

  /**
   * Calculates overtime pay for a given hourly rate, hours, and type.
   *
   * @param hourlyRate base hourly rate in MAD
   * @param hours number of overtime hours worked
   * @param type overtime category: day, night, or holiday
   * @param year fiscal year
   */
  public static BigDecimal calculateOvertime(
      BigDecimal hourlyRate, BigDecimal hours, OvertimeType type, FiscalYear year) {
    return PayrollEngine.calculateOvertime(hourlyRate, hours, type, year);
  }

  /**
   * Calculates overtime pay (defaults to 2025).
   */
  public static BigDecimal calculateOvertime(
      BigDecimal hourlyRate, BigDecimal hours, OvertimeType type) {
    return calculateOvertime(hourlyRate, hours, type, FiscalYear.Y2025);
  }

  /**
   * Calculates seniority bonus (prime d'ancienneté) based on years of service.
   *
   * @param grossSalary monthly gross salary in MAD
   * @param yearsOfService completed years of service
   * @param year fiscal year
   */
  public static BigDecimal calculateSeniority(
      BigDecimal grossSalary, int yearsOfService, FiscalYear year) {
    return PayrollEngine.calculateSeniority(grossSalary, yearsOfService, year);
  }

  /**
   * Calculates seniority bonus (defaults to 2025).
   */
  public static BigDecimal calculateSeniority(BigDecimal grossSalary, int yearsOfService) {
    return calculateSeniority(grossSalary, yearsOfService, FiscalYear.Y2025);
  }

  /**
   * Generates a structured monthly payslip for an employee.
   *
   * @param employeeInfo employee identification and role details
   * @param gross monthly gross salary in MAD
   * @param dependents number of dependents
   * @param year fiscal year
   * @param month payslip month (1–12)
   */
  public static PayslipResult generatePayslip(
      EmployeeInfo employeeInfo,
      BigDecimal gross,
      int dependents,
      FiscalYear year,
      int month) {
    return PayrollEngine.generatePayslip(employeeInfo, gross, dependents, year, month);
  }

  /**
   * Generates a structured monthly payslip (defaults to 2025 and current month).
   */
  public static PayslipResult generatePayslip(
      EmployeeInfo employeeInfo, BigDecimal gross, int dependents) {
    return generatePayslip(
        employeeInfo,
        gross,
        dependents,
        FiscalYear.Y2025,
        LocalDate.now().getMonthValue());
  }
}
