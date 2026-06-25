package ma.maroctax.api.dto;

import java.math.BigDecimal;

public record ReverseNetRequest(BigDecimal targetNet, int dependents, Integer year) {}
