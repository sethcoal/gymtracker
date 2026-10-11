import { Workout, MuscleGroupTarget } from './types';
import { MUSCLE_GROUPS } from './data/exercises';

const WORKOUTS_KEY = 'fittrack_workouts';
const TARGETS_KEY = 'fittrack_targets';
const FOCUSED_EXERCISES_KEY = 'fittrack_focused_exercises';

export function loadWorkouts(): Workout[] {
  try {
    const data = localStorage.getItem(WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWorkouts(workouts: Workout[]): void {
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function loadTargets(): MuscleGroupTarget[] {
  try {
    const data = localStorage.getItem(TARGETS_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // fall through
  }
  // Default: 3 working sets per week for each muscle group
  return MUSCLE_GROUPS.map((mg) => ({
    muscleGroup: mg,
    targetSets: 3,
  }));
}

export function saveTargets(targets: MuscleGroupTarget[]): void {
  localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
}

export function loadFocusedExercises(): string[] {
  try {
    const data = localStorage.getItem(FOCUSED_EXERCISES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFocusedExercises(exerciseIds: string[]): void {
  localStorage.setItem(FOCUSED_EXERCISES_KEY, JSON.stringify(exerciseIds));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
