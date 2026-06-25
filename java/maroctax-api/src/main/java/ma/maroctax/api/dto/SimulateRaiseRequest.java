package ma.maroctax.api.dto;

import java.math.BigDecimal;

public record SimulateRaiseRequest(
    BigDecimal currentGross, BigDecimal newGross, int dependents, Integer year) {}
