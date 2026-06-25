package ma.maroctax;

import java.math.BigDecimal;

/** Employer-side cost breakdown. */
public record EmployerCostResult(
    BigDecimal gross,
    BigDecimal employerCnss,
    BigDecimal employerCnssAccident,
    BigDecimal employerAmo,
    BigDecimal employerTraining,
    BigDecimal totalEmployerContributions,
    BigDecimal totalCost) {}
