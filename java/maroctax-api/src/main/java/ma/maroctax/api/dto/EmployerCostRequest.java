package ma.maroctax.api.dto;

import java.math.BigDecimal;

public record EmployerCostRequest(BigDecimal gross, Integer year) {}
