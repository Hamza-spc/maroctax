package ma.maroctax;

import java.math.BigDecimal;

/**
 * Moroccan payroll calculation engine.
 *
 * <p>All monetary values use {@link BigDecimal} with HALF_UP rounding to 2 decimal places.
 */
public final class MarocTax {

  private MarocTax() {}

  // Logic implemented in step 3.2.
  public static SalaryResult calculateNetSalary(BigDecimal gross, int dependents, FiscalYear year) {
    throw new UnsupportedOperationException("Not yet implemented");
  }
}
