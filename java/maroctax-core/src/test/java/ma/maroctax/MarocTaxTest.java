package ma.maroctax;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

class MarocTaxTest {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  record Fixture(int gross, int dependents, double expectedNet) {}

  static List<Fixture> fixtures() throws IOException {
    Path path = Path.of("../../tests/fixtures.json").toAbsolutePath().normalize();
    return MAPPER.readValue(path.toFile(), new TypeReference<>() {});
  }

  @ParameterizedTest
  @MethodSource("fixtures")
  void calculateNetSalary_matchesFixtures(Fixture fixture) {
    SalaryResult result =
        MarocTax.calculateNetSalary(
            BigDecimal.valueOf(fixture.gross()), fixture.dependents(), FiscalYear.Y2025);

    assertEquals(
        fixture.expectedNet(),
        result.net().doubleValue(),
        0.01,
        "net salary mismatch for gross " + fixture.gross());
  }

  @ParameterizedTest
  @MethodSource("fixtures")
  void calculateEmployerCost_exceedsGross(Fixture fixture) {
    EmployerCostResult result =
        MarocTax.calculateEmployerCost(BigDecimal.valueOf(fixture.gross()));

    assertTrue(result.totalCost().compareTo(BigDecimal.valueOf(fixture.gross())) > 0);
    assertTrue(result.totalEmployerContributions().compareTo(BigDecimal.ZERO) > 0);
  }

  @ParameterizedTest
  @MethodSource("fixtures")
  void reverseFromNet_recoversTargetNet(Fixture fixture) {
    BigDecimal target = BigDecimal.valueOf(fixture.expectedNet());
    BigDecimal gross = MarocTax.reverseFromNet(target, fixture.dependents());
    BigDecimal net = MarocTax.calculateNetSalary(gross, fixture.dependents()).net();

    assertEquals(target.doubleValue(), net.doubleValue(), 0.01);
  }

  @ParameterizedTest
  @MethodSource("fixtures")
  void simulateRaise_increasesNet(Fixture fixture) {
    BigDecimal gross = BigDecimal.valueOf(fixture.gross());
    RaiseSimulationResult result =
        MarocTax.simulateRaise(gross, gross.add(BigDecimal.valueOf(1000)), fixture.dependents());

    assertEquals(0, result.deltaGross().compareTo(BigDecimal.valueOf(1000)));
    assertTrue(result.deltaNet().compareTo(BigDecimal.ZERO) > 0);
    assertTrue(result.after().net().compareTo(result.before().net()) > 0);
  }

  @Test
  void checkSMIG_atMinimum() {
    assertTrue(MarocTax.checkSMIG(BigDecimal.valueOf(3500)));
    assertTrue(!MarocTax.checkSMIG(BigDecimal.valueOf(3499)));
  }

  @Test
  void calculateOvertime_appliesPremiums() {
    assertEquals(
        0,
        MarocTax.calculateOvertime(BigDecimal.valueOf(100), BigDecimal.valueOf(2), OvertimeType.DAY)
            .compareTo(BigDecimal.valueOf(250)));
    assertEquals(
        0,
        MarocTax.calculateOvertime(
                BigDecimal.valueOf(100), BigDecimal.valueOf(2), OvertimeType.NIGHT)
            .compareTo(BigDecimal.valueOf(300)));
    assertEquals(
        0,
        MarocTax.calculateOvertime(
                BigDecimal.valueOf(100), BigDecimal.valueOf(2), OvertimeType.HOLIDAY)
            .compareTo(BigDecimal.valueOf(400)));
  }

  @Test
  void calculateSeniority_appliesRates() {
    assertEquals(
        0,
        MarocTax.calculateSeniority(BigDecimal.valueOf(10000), 1).compareTo(BigDecimal.ZERO));
    assertEquals(
        0,
        MarocTax.calculateSeniority(BigDecimal.valueOf(10000), 3).compareTo(BigDecimal.valueOf(500)));
  }

  @Test
  void generatePayslip_includesBreakdown() {
    PayslipResult payslip =
        MarocTax.generatePayslip(
            new EmployeeInfo("1", "A", "B"),
            BigDecimal.valueOf(10000),
            0,
            FiscalYear.Y2025,
            6);

    assertEquals("A", payslip.employee().firstName());
    assertEquals(8723.95, payslip.breakdown().net().doubleValue(), 0.01);
    assertTrue(payslip.employerCost().totalCost().compareTo(BigDecimal.valueOf(10000)) > 0);
    assertEquals(6, payslip.month());
  }
}
