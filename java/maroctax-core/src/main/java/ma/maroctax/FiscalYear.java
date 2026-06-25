package ma.maroctax;

/** Supported fiscal years. */
public enum FiscalYear {
  Y2024(2024),
  Y2025(2025);

  private final int value;

  FiscalYear(int value) {
    this.value = value;
  }

  public int getValue() {
    return value;
  }

  public static FiscalYear of(int year) {
    return switch (year) {
      case 2024 -> Y2024;
      case 2025 -> Y2025;
      default -> throw new IllegalArgumentException("Unsupported fiscal year: " + year);
    };
  }
}
