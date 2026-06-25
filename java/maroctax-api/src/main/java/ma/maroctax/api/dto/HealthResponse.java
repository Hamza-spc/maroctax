package ma.maroctax.api.dto;

import java.util.Map;

public record HealthResponse(String status, String service, String version) {

  public static HealthResponse ok() {
    return new HealthResponse("UP", "maroctax-api", "0.1.0");
  }

  public Map<String, String> asMap() {
    return Map.of("status", status, "service", service, "version", version);
  }
}
