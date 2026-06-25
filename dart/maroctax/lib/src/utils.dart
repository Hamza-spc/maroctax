/// Rounds monetary amounts to 2 decimal places (MAD).
double roundMoney(double value) {
  return (value * 100).roundToDouble() / 100;
}

/// Clamps dependents to the configured maximum.
int clampDependents(int dependents, int max) {
  return dependents.clamp(0, max);
}
