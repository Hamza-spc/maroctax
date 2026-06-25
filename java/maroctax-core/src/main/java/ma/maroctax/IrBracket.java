package ma.maroctax;

import java.math.BigDecimal;

/** Progressive income-tax bracket (annual amounts in MAD). */
public record IrBracket(BigDecimal upTo, BigDecimal rate, BigDecimal deduction) {}
