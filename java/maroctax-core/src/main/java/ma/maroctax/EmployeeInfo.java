package ma.maroctax;

import java.math.BigDecimal;

/** Employee identification for payslip generation. */
public record EmployeeInfo(
    String id,
    String firstName,
    String lastName,
    String position,
    String department,
    String hireDate) {

  public EmployeeInfo(String id, String firstName, String lastName) {
    this(id, firstName, lastName, null, null, null);
  }
}
