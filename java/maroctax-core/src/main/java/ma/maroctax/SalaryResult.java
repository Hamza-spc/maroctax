package ma.maroctax;

import java.math.BigDecimal;

/** Full net-salary breakdown. */
public record SalaryResult(
    FiscalYear year,
    BigDecimal gross,
    int dependents,
    BigDecimal cnss,
    BigDecimal amo,
    BigDecimal fraisProfessionnels,
    BigDecimal netTaxableMonthly,
    BigDecimal netTaxableAnnual,
    BigDecimal dependentDeductionAnnual,
    BigDecimal irGrossAnnual,
    BigDecimal ir,
    BigDecimal net) {}
