package ma.maroctax;

import java.math.BigDecimal;

/** Before/after comparison for a salary raise. */
public record RaiseSimulationResult(
    FiscalYear year,
    int dependents,
    SalaryResult before,
    SalaryResult after,
    BigDecimal deltaGross,
    BigDecimal deltaNet,
    BigDecimal deltaIr,
    BigDecimal marginalNetRate) {}
