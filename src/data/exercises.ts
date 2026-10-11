export interface Exercise {
  id: string;
  name: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
}

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Core',
  'Forearms',
  'Calves',
] as const;

export const EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', primaryMuscleGroup: 'Chest', secondaryMuscleGroups: ['Triceps', 'Shoulders'] },
  { id: 'incline-bench', name: 'Incline Bench Press', primaryMuscleGroup: 'Chest', secondaryMuscleGroups: ['Triceps', 'Shoulders'] },
  { id: 'dumbbell-fly', name: 'Dumbbell Fly', primaryMuscleGroup: 'Chest', secondaryMuscleGroups: ['Shoulders'] },
  { id: 'cable-crossover', name: 'Cable Crossover', primaryMuscleGroup: 'Chest', secondaryMuscleGroups: ['Shoulders'] },
  { id: 'push-ups', name: 'Push-ups', primaryMuscleGroup: 'Chest', secondaryMuscleGroups: ['Triceps', 'Shoulders', 'Core'] },
  { id: 'dips', name: 'Dips', primaryMuscleGroup: 'Chest', secondaryMuscleGroups: ['Triceps', 'Shoulders'] },

  // Back
  { id: 'deadlift', name: 'Deadlift', primaryMuscleGroup: 'Back', secondaryMuscleGroups: ['Glutes', 'Legs', 'Core', 'Forearms'] },
  { id: 'pull-ups', name: 'Pull-ups', primaryMuscleGroup: 'Back', secondaryMuscleGroups: ['Biceps', 'Forearms'] },
  { id: 'barbell-row', name: 'Barbell Row', primaryMuscleGroup: 'Back', secondaryMuscleGroups: ['Biceps', 'Forearms'] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', primaryMuscleGroup: 'Back', secondaryMuscleGroups: ['Biceps', 'Forearms'] },
  { id: 'seated-cable-row', name: 'Seated Cable Row', primaryMuscleGroup: 'Back', secondaryMuscleGroups: ['Biceps', 'Forearms'] },
  { id: 't-bar-row', name: 'T-Bar Row', primaryMuscleGroup: 'Back', secondaryMuscleGroups: ['Biceps', 'Forearms'] },
  { id: 'face-pull', name: 'Face Pull', primaryMuscleGroup: 'Back', secondaryMuscleGroups: ['Shoulders'] },

  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press', primaryMuscleGroup: 'Shoulders', secondaryMuscleGroups: ['Triceps', 'Core'] },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', primaryMuscleGroup: 'Shoulders', secondaryMuscleGroups: ['Triceps', 'Core'] },
  { id: 'lateral-raise', name: 'Lateral Raise', primaryMuscleGroup: 'Shoulders', secondaryMuscleGroups: [] },
  { id: 'front-raise', name: 'Front Raise', primaryMuscleGroup: 'Shoulders', secondaryMuscleGroups: [] },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', primaryMuscleGroup: 'Shoulders', secondaryMuscleGroups: ['Back'] },
  { id: 'upright-row', name: 'Upright Row', primaryMuscleGroup: 'Shoulders', secondaryMuscleGroups: ['Biceps', 'Back'] },

  // Biceps
  { id: 'barbell-curl', name: 'Barbell Curl', primaryMuscleGroup: 'Biceps', secondaryMuscleGroups: ['Forearms'] },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', primaryMuscleGroup: 'Biceps', secondaryMuscleGroups: ['Forearms'] },
  { id: 'hammer-curl', name: 'Hammer Curl', primaryMuscleGroup: 'Biceps', secondaryMuscleGroups: ['Forearms'] },
  { id: 'preacher-curl', name: 'Preacher Curl', primaryMuscleGroup: 'Biceps', secondaryMuscleGroups: [] },
  { id: 'concentration-curl', name: 'Concentration Curl', primaryMuscleGroup: 'Biceps', secondaryMuscleGroups: [] },

  // Triceps
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', primaryMuscleGroup: 'Triceps', secondaryMuscleGroups: [] },
  { id: 'tricep-extension', name: 'Overhead Tricep Extension', primaryMuscleGroup: 'Triceps', secondaryMuscleGroups: [] },
  { id: 'skull-crushers', name: 'Skull Crushers', primaryMuscleGroup: 'Triceps', secondaryMuscleGroups: [] },
  { id: 'close-grip-bench', name: 'Close Grip Bench Press', primaryMuscleGroup: 'Triceps', secondaryMuscleGroups: ['Chest'] },
  { id: 'tricep-dips', name: 'Tricep Dips', primaryMuscleGroup: 'Triceps', secondaryMuscleGroups: ['Chest'] },

  // Legs
  { id: 'squat', name: 'Squat', primaryMuscleGroup: 'Legs', secondaryMuscleGroups: ['Glutes', 'Core'] },
  { id: 'leg-press', name: 'Leg Press', primaryMuscleGroup: 'Legs', secondaryMuscleGroups: ['Glutes'] },
  { id: 'leg-extension', name: 'Leg Extension', primaryMuscleGroup: 'Legs', secondaryMuscleGroups: [] },
  { id: 'leg-curl', name: 'Leg Curl', primaryMuscleGroup: 'Legs', secondaryMuscleGroups: [] },
  { id: 'lunges', name: 'Lunges', primaryMuscleGroup: 'Legs', secondaryMuscleGroups: ['Glutes'] },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', primaryMuscleGroup: 'Legs', secondaryMuscleGroups: ['Glutes'] },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', primaryMuscleGroup: 'Legs', secondaryMuscleGroups: ['Glutes', 'Back'] },

  // Glutes
  { id: 'hip-thrust', name: 'Hip Thrust', primaryMuscleGroup: 'Glutes', secondaryMuscleGroups: ['Legs'] },
  { id: 'glute-bridge', name: 'Glute Bridge', primaryMuscleGroup: 'Glutes', secondaryMuscleGroups: ['Legs'] },
  { id: 'cable-kickback', name: 'Cable Kickback', primaryMuscleGroup: 'Glutes', secondaryMuscleGroups: [] },
  { id: 'sumo-squat', name: 'Sumo Squat', primaryMuscleGroup: 'Glutes', secondaryMuscleGroups: ['Legs'] },

  // Core
  { id: 'plank', name: 'Plank', primaryMuscleGroup: 'Core', secondaryMuscleGroups: [] },
  { id: 'crunches', name: 'Crunches', primaryMuscleGroup: 'Core', secondaryMuscleGroups: [] },
  { id: 'russian-twist', name: 'Russian Twist', primaryMuscleGroup: 'Core', secondaryMuscleGroups: [] },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', primaryMuscleGroup: 'Core', secondaryMuscleGroups: ['Forearms'] },
  { id: 'cable-crunch', name: 'Cable Crunch', primaryMuscleGroup: 'Core', secondaryMuscleGroups: [] },
  { id: 'dead-bug', name: 'Dead Bug', primaryMuscleGroup: 'Core', secondaryMuscleGroups: [] },

  // Forearms
  { id: 'wrist-curl', name: 'Wrist Curl', primaryMuscleGroup: 'Forearms', secondaryMuscleGroups: [] },
  { id: 'reverse-wrist-curl', name: 'Reverse Wrist Curl', primaryMuscleGroup: 'Forearms', secondaryMuscleGroups: [] },
  { id: 'farmer-walk', name: "Farmer's Walk", primaryMuscleGroup: 'Forearms', secondaryMuscleGroups: ['Core', 'Back'] },

  // Calves
  { id: 'standing-calf-raise', name: 'Standing Calf Raise', primaryMuscleGroup: 'Calves', secondaryMuscleGroups: [] },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', primaryMuscleGroup: 'Calves', secondaryMuscleGroups: [] },
  { id: 'donkey-calf-raise', name: 'Donkey Calf Raise', primaryMuscleGroup: 'Calves', secondaryMuscleGroups: [] },
];

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  return EXERCISES.filter(
    (e) => e.primaryMuscleGroup === muscleGroup || e.secondaryMuscleGroups.includes(muscleGroup)
  );
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
