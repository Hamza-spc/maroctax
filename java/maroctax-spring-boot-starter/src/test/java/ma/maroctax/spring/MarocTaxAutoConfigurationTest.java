package ma.maroctax.spring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = MarocTaxTestApplication.class)
@ImportAutoConfiguration(MarocTaxAutoConfiguration.class)
class MarocTaxAutoConfigurationTest {

  @Autowired private MarocTaxService marocTaxService;

  private final ObjectMapper mapper = new ObjectMapper();

  @Test
  void marocTaxServiceBeanIsPresent() {
    assertNotNull(marocTaxService);
  }

  @Test
  void calculateNetSalary_matchesFixtures() throws IOException {
    Path path = Path.of("../../tests/fixtures.json").toAbsolutePath().normalize();
    List<Map<String, Object>> fixtures =
        mapper.readValue(path.toFile(), new TypeReference<>() {});

    for (Map<String, Object> fixture : fixtures) {
      double gross = ((Number) fixture.get("gross")).doubleValue();
      int dependents = ((Number) fixture.get("dependents")).intValue();
      double expectedNet = ((Number) fixture.get("expectedNet")).doubleValue();

      var result = marocTaxService.calculateNetSalary(BigDecimal.valueOf(gross), dependents);

      assertEquals(
          expectedNet,
          result.net().doubleValue(),
          0.01,
          "net mismatch for gross " + gross);
    }
  }
}
