package ma.maroctax.spring;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

/** Spring Boot auto-configuration for {@link MarocTaxService}. */
@AutoConfiguration
@EnableConfigurationProperties(MarocTaxProperties.class)
public class MarocTaxAutoConfiguration {

  @Bean
  @ConditionalOnMissingBean
  public MarocTaxService marocTaxService(MarocTaxProperties properties) {
    return new MarocTaxService(properties);
  }
}
