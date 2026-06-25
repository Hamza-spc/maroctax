package ma.maroctax;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Monetary helpers — all amounts rounded HALF_UP to 2 decimal places (MAD). */
final class Money {

  static final int SCALE = 2;
  static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

  private Money() {}

  static BigDecimal of(String value) {
    return new BigDecimal(value);
  }

  static BigDecimal of(double value) {
    return BigDecimal.valueOf(value);
  }

  static BigDecimal round(BigDecimal value) {
    return value.setScale(SCALE, ROUNDING);
  }

  static int clampDependents(int dependents, int max) {
    return Math.min(Math.max(0, dependents), max);
  }
}
