package ma.maroctax.api.dto;

import java.math.BigDecimal;
import ma.maroctax.EmployeeInfo;

public record PayslipRequest(
    EmployeeInfo employeeInfo, BigDecimal gross, int dependents, Integer year, Integer month) {}
