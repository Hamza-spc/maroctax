package ma.maroctax.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PayrollControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper mapper = new ObjectMapper();

  @Test
  void healthReturnsUp() throws Exception {
    mockMvc
        .perform(get("/api/v1/health"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("UP"));
  }

  @Test
  void netSalary_matchesFixtures() throws Exception {
    Path path = Path.of("../../tests/fixtures.json").toAbsolutePath().normalize();
    List<Map<String, Object>> fixtures =
        mapper.readValue(path.toFile(), new TypeReference<>() {});

    for (Map<String, Object> fixture : fixtures) {
      double gross = ((Number) fixture.get("gross")).doubleValue();
      int dependents = ((Number) fixture.get("dependents")).intValue();
      double expectedNet = ((Number) fixture.get("expectedNet")).doubleValue();

      String body =
          mapper.writeValueAsString(Map.of("gross", gross, "dependents", dependents, "year", 2025));

      mockMvc
          .perform(post("/api/v1/net-salary").contentType(MediaType.APPLICATION_JSON).content(body))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.net").value(org.hamcrest.Matchers.closeTo(expectedNet, 0.01)));
    }
  }

  @Test
  void employerCost_returnsPositiveTotal() throws Exception {
    String body = mapper.writeValueAsString(Map.of("gross", 10000));

    mockMvc
        .perform(
            post("/api/v1/employer-cost").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalCost").isNumber())
        .andExpect(jsonPath("$.totalCost").value(org.hamcrest.Matchers.greaterThan(10000.0)));
  }
}
