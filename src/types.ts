export interface WorkoutSet {
  id: string;
  type: 'warmup' | 'working';
  reps: number;
  weight: number; // in kg
}

export interface ExerciseEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  date: string; // ISO date string
  exercises: ExerciseEntry[];
  notes?: string;
}

export interface MuscleGroupTarget {
  muscleGroup: string;
  targetSets: number; // minimum working sets per week
}

export type Page = 'home' | 'workout' | 'calendar' | 'tracker' | 'exercise-focus' | 'exercise-detail';
