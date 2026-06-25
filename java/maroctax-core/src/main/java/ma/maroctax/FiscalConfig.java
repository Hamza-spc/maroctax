package ma.maroctax;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Year-specific payroll parameters. */
public record FiscalConfig(
    FiscalYear year,
    BigDecimal smig,
    BigDecimal cnssEmployeeRate,
    BigDecimal cnssEmployeeCap,
    BigDecimal amoEmployeeRate,
    BigDecimal fraisProfessionnelsRate,
    BigDecimal fraisProfessionnelsMonthlyCap,
    BigDecimal dependentDeductionAnnual,
    int maxDependents,
    List<IrBracket> irBrackets,
    BigDecimal employerCnssRate,
    BigDecimal employerCnssAccidentRate,
    BigDecimal employerAmoRate,
    BigDecimal employerTrainingRate,
    Map<OvertimeType, BigDecimal> overtimeMultipliers,
    List<SeniorityRate> seniorityRates) {

  public record SeniorityRate(int minYears, BigDecimal rate) {}
}
