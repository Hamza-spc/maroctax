/** Round monetary amounts to 2 decimal places (MAD). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Clamp dependents to the configured maximum. */
export function clampDependents(dependents: number, max: number): number {
  return Math.min(Math.max(0, Math.floor(dependents)), max);
}
