package ma.maroctax;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;

/** Internal payroll calculation logic (BigDecimal only). */
final class PayrollEngine {

  private PayrollEngine() {}

  static BigDecimal calculateCnss(BigDecimal gross, FiscalConfig config) {
    BigDecimal base = gross.min(config.cnssEmployeeCap());
    return Money.round(base.multiply(config.cnssEmployeeRate()));
  }

  static BigDecimal calculateAmo(BigDecimal gross, FiscalConfig config) {
    return Money.round(gross.multiply(config.amoEmployeeRate()));
  }

  static BigDecimal calculateFraisProfessionnels(
      BigDecimal grossAfterSocial, FiscalConfig config) {
    BigDecimal uncapped = grossAfterSocial.multiply(config.fraisProfessionnelsRate());
    return Money.round(uncapped.min(config.fraisProfessionnelsMonthlyCap()));
  }

  static BigDecimal calculateIrAnnual(BigDecimal netTaxableAnnual, FiscalConfig config) {
    BigDecimal taxable = netTaxableAnnual.max(BigDecimal.ZERO);

    for (IrBracket bracket : config.irBrackets()) {
      if (taxable.compareTo(bracket.upTo()) <= 0) {
        BigDecimal ir =
            taxable.multiply(bracket.rate()).subtract(bracket.deduction()).max(BigDecimal.ZERO);
        return Money.round(ir);
      }
    }

    return BigDecimal.ZERO.setScale(Money.SCALE, Money.ROUNDING);
  }

  static SalaryResult calculateNetSalary(BigDecimal gross, int dependents, FiscalYear year) {
    FiscalConfig config = FiscalConfigs.get(year);
    int countedDependents = Money.clampDependents(dependents, config.maxDependents());

    BigDecimal cnss = calculateCnss(gross, config);
    BigDecimal amo = calculateAmo(gross, config);
    BigDecimal grossAfterSocial = Money.round(gross.subtract(cnss).subtract(amo));
    BigDecimal fraisProfessionnels = calculateFraisProfessionnels(grossAfterSocial, config);
    BigDecimal netTaxableMonthly = Money.round(grossAfterSocial.subtract(fraisProfessionnels));
    BigDecimal dependentDeductionAnnual =
        config.dependentDeductionAnnual().multiply(BigDecimal.valueOf(countedDependents));
    BigDecimal netTaxableAnnual =
        Money.round(
            netTaxableMonthly
                .multiply(BigDecimal.valueOf(12))
                .subtract(dependentDeductionAnnual)
                .max(BigDecimal.ZERO));
    BigDecimal irGrossAnnual = calculateIrAnnual(netTaxableAnnual, config);
    BigDecimal ir =
        Money.round(
            irGrossAnnual.divide(BigDecimal.valueOf(12), Money.SCALE + 4, Money.ROUNDING));
    BigDecimal net = Money.round(gross.subtract(cnss).subtract(amo).subtract(ir));

    return new SalaryResult(
        year,
        Money.round(gross),
        countedDependents,
        cnss,
        amo,
        fraisProfessionnels,
        netTaxableMonthly,
        netTaxableAnnual,
        dependentDeductionAnnual,
        irGrossAnnual,
        ir,
        net);
  }

  static EmployerCostResult calculateEmployerCost(BigDecimal gross, FiscalYear year) {
    FiscalConfig config = FiscalConfigs.get(year);
    BigDecimal cappedBase = gross.min(config.cnssEmployeeCap());

    BigDecimal employerCnss = Money.round(cappedBase.multiply(config.employerCnssRate()));
    BigDecimal employerCnssAccident =
        Money.round(gross.multiply(config.employerCnssAccidentRate()));
    BigDecimal employerAmo = Money.round(gross.multiply(config.employerAmoRate()));
    BigDecimal employerTraining = Money.round(gross.multiply(config.employerTrainingRate()));
    BigDecimal totalEmployerContributions =
        Money.round(
            employerCnss
                .add(employerCnssAccident)
                .add(employerAmo)
                .add(employerTraining));

    return new EmployerCostResult(
        Money.round(gross),
        employerCnss,
        employerCnssAccident,
        employerAmo,
        employerTraining,
        totalEmployerContributions,
        Money.round(gross.add(totalEmployerContributions)));
  }

  static BigDecimal reverseFromNet(BigDecimal targetNet, int dependents, FiscalYear year) {
    if (targetNet.compareTo(BigDecimal.ZERO) <= 0) {
      return BigDecimal.ZERO.setScale(Money.SCALE, Money.ROUNDING);
    }

    BigDecimal low = targetNet;
    BigDecimal high = targetNet.multiply(BigDecimal.valueOf(3));

    while (calculateNetSalary(high, dependents, year).net().compareTo(targetNet) < 0) {
      high = high.multiply(BigDecimal.valueOf(2));
    }

    for (int i = 0; i < 64; i++) {
      BigDecimal mid = Money.round(low.add(high).divide(BigDecimal.valueOf(2), Money.ROUNDING));
      BigDecimal net = calculateNetSalary(mid, dependents, year).net();

      if (net.compareTo(targetNet) < 0) {
        low = mid;
      } else {
        high = mid;
      }
    }

    BigDecimal gross =
        high.setScale(Money.SCALE, java.math.RoundingMode.CEILING);

    while (gross.compareTo(BigDecimal.ZERO) > 0
        && calculateNetSalary(gross, dependents, year).net().compareTo(targetNet) > 0) {
      gross = Money.round(gross.subtract(Money.of("0.01")));
    }
    while (calculateNetSalary(gross, dependents, year).net().compareTo(targetNet) < 0) {
      gross = Money.round(gross.add(Money.of("0.01")));
    }

    return gross;
  }

  static RaiseSimulationResult simulateRaise(
      BigDecimal currentGross, BigDecimal newGross, int dependents, FiscalYear year) {
    SalaryResult before = calculateNetSalary(currentGross, dependents, year);
    SalaryResult after = calculateNetSalary(newGross, dependents, year);
    BigDecimal deltaGross = Money.round(newGross.subtract(currentGross));
    BigDecimal deltaNet = Money.round(after.net().subtract(before.net()));
    BigDecimal deltaIr = Money.round(after.ir().subtract(before.ir()));
    BigDecimal marginalNetRate =
        deltaGross.compareTo(BigDecimal.ZERO) == 0
            ? BigDecimal.ZERO.setScale(Money.SCALE, Money.ROUNDING)
            : Money.round(deltaNet.divide(deltaGross, Money.SCALE + 4, Money.ROUNDING));

    return new RaiseSimulationResult(
        year, dependents, before, after, deltaGross, deltaNet, deltaIr, marginalNetRate);
  }

  static boolean checkSmig(BigDecimal gross, FiscalYear year) {
    return gross.compareTo(FiscalConfigs.get(year).smig()) >= 0;
  }

  static BigDecimal calculateOvertime(
      BigDecimal hourlyRate, BigDecimal hours, OvertimeType type, FiscalYear year) {
    BigDecimal multiplier = FiscalConfigs.get(year).overtimeMultipliers().get(type);
    return Money.round(hourlyRate.multiply(hours).multiply(multiplier));
  }

  static BigDecimal calculateSeniority(
      BigDecimal grossSalary, int yearsOfService, FiscalYear year) {
    BigDecimal rate =
        FiscalConfigs.get(year).seniorityRates().stream()
            .filter(entry -> yearsOfService >= entry.minYears())
            .max(Comparator.comparingInt(FiscalConfig.SeniorityRate::minYears))
            .map(FiscalConfig.SeniorityRate::rate)
            .orElse(BigDecimal.ZERO);

    return Money.round(grossSalary.multiply(rate));
  }

  static PayslipResult generatePayslip(
      EmployeeInfo employee,
      BigDecimal gross,
      int dependents,
      FiscalYear year,
      int month) {
    return new PayslipResult(
        employee,
        year,
        month,
        calculateNetSalary(gross, dependents, year),
        calculateEmployerCost(gross, year),
        Instant.now());
  }
}
