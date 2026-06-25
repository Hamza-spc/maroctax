package ma.maroctax;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Registry of fiscal configurations keyed by year. */
public final class FiscalConfigs {

  private static final List<IrBracket> IR_BRACKETS_2025 =
      List.of(
          new IrBracket(bd("40000"), bd("0"), bd("0")),
          new IrBracket(bd("60000"), bd("0.10"), bd("4000")),
          new IrBracket(bd("80000"), bd("0.20"), bd("10000")),
          new IrBracket(bd("100000"), bd("0.30"), bd("18000")),
          new IrBracket(bd("180000"), bd("0.34"), bd("22000")),
          new IrBracket(new BigDecimal("999999999"), bd("0.37"), bd("27400")));

  private static final FiscalConfig BASE_2025 =
      new FiscalConfig(
          FiscalYear.Y2025,
          bd("3500"),
          bd("0.0448"),
          bd("6000"),
          bd("0.0226"),
          bd("0.20"),
          bd("2500"),
          bd("500"),
          6,
          IR_BRACKETS_2025,
          bd("0.0898"),
          bd("0.0105"),
          bd("0.0226"),
          bd("0.016"),
          Map.of(
              OvertimeType.DAY, bd("1.25"),
              OvertimeType.NIGHT, bd("1.50"),
              OvertimeType.HOLIDAY, bd("2.00")),
          List.of(
              new FiscalConfig.SeniorityRate(25, bd("0.25")),
              new FiscalConfig.SeniorityRate(20, bd("0.20")),
              new FiscalConfig.SeniorityRate(12, bd("0.15")),
              new FiscalConfig.SeniorityRate(5, bd("0.10")),
              new FiscalConfig.SeniorityRate(2, bd("0.05"))));

  private FiscalConfigs() {}

  public static FiscalConfig get(FiscalYear year) {
    return switch (year) {
      case Y2024 -> withYear(FiscalYear.Y2024, BASE_2025);
      case Y2025 -> BASE_2025;
    };
  }

  public static FiscalConfig get(int year) {
    return get(FiscalYear.of(year));
  }

  private static FiscalConfig withYear(FiscalYear year, FiscalConfig template) {
    return new FiscalConfig(
        year,
        template.smig(),
        template.cnssEmployeeRate(),
        template.cnssEmployeeCap(),
        template.amoEmployeeRate(),
        template.fraisProfessionnelsRate(),
        template.fraisProfessionnelsMonthlyCap(),
        template.dependentDeductionAnnual(),
        template.maxDependents(),
        template.irBrackets(),
        template.employerCnssRate(),
        template.employerCnssAccidentRate(),
        template.employerAmoRate(),
        template.employerTrainingRate(),
        template.overtimeMultipliers(),
        template.seniorityRates());
  }

  private static BigDecimal bd(String value) {
    return new BigDecimal(value);
  }
}
