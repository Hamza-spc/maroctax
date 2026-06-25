package ma.maroctax.api.dto;

import java.math.BigDecimal;

public record NetSalaryRequest(BigDecimal gross, int dependents, Integer year) {}
