import type { TeamPlan } from './planner-types';
import { defaultPlan } from './planner-utils';

const STORAGE_KEY = 'maroctax.demo.teamPlan.v1';

export function loadPlan(fallbackYear: TeamPlan['year']): TeamPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPlan(fallbackYear);
    const parsed = JSON.parse(raw) as TeamPlan;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.employees)) {
      return defaultPlan(fallbackYear);
    }
    return parsed;
  } catch {
    return defaultPlan(fallbackYear);
  }
}

export function savePlan(plan: TeamPlan): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

