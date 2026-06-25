package ma.maroctax.spring;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configuration properties for maroctax Spring Boot integration. */
@ConfigurationProperties(prefix = "maroctax")
public class MarocTaxProperties {

  /** Default fiscal year for payroll calculations when not specified per call. */
  private int defaultYear = 2025;

  public int getDefaultYear() {
    return defaultYear;
  }

  public void setDefaultYear(int defaultYear) {
    this.defaultYear = defaultYear;
  }
}
