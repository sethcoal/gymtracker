import { useState, useRef } from 'react';
import { Workout, ExerciseEntry, WorkoutSet } from '../types';
import { Exercise } from '../data/exercises';
import { generateId } from '../storage';
import ExercisePicker from './ExercisePicker';

interface WorkoutPageProps {
  workout: Workout;
  setWorkout: (w: Workout) => void;
  onFinish: () => void;
  onCancel: () => void;
}

export default function WorkoutPage({ workout, setWorkout, onFinish, onCancel }: WorkoutPageProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [setMode, setSetMode] = useState<'warmup' | 'working'>('warmup');
  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});
  const [repsInputs, setRepsInputs] = useState<Record<string, string>>({});
  const toggleRef = useRef<HTMLDivElement>(null);

  const addExercise = (exercise: Exercise) => {
    const entry: ExerciseEntry = {
      id: generateId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      primaryMuscleGroup: exercise.primaryMuscleGroup,
      secondaryMuscleGroups: exercise.secondaryMuscleGroups,
      sets: [],
    };
    setWorkout({ ...workout, exercises: [...workout.exercises, entry] });
    setShowPicker(false);
  };

  const removeExercise = (entryId: string) => {
    setWorkout({
      ...workout,
      exercises: workout.exercises.filter((e) => e.id !== entryId),
    });
  };

  const addSet = (entryId: string) => {
    const weightKey = `${entryId}-weight`;
    const repsKey = `${entryId}-reps`;
    const weight = parseFloat(weightInputs[weightKey] || '0');
    const reps = parseInt(repsInputs[repsKey] || '0', 10);

    if (reps <= 0) return;

    const newSet: WorkoutSet = {
      id: generateId(),
      type: setMode,
      reps,
      weight: isNaN(weight) ? 0 : weight,
    };

    setWorkout({
      ...workout,
      exercises: workout.exercises.map((e) =>
        e.id === entryId ? { ...e, sets: [...e.sets, newSet] } : e
      ),
    });

    // Note: weight and reps inputs are NOT cleared — they're retained for quick entry of similar sets
  };

  const removeSet = (entryId: string, setId: string) => {
    setWorkout({
      ...workout,
      exercises: workout.exercises.map((e) =>
        e.id === entryId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e
      ),
    });
  };

  const handleModeToggle = (mode: 'warmup' | 'working') => {
    setSetMode(mode);
  };

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const workingSets = workout.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.type === 'working').length,
    0
  );

  if (showPicker) {
    return <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="header">
        <button className="header-back" onClick={onCancel}>✕</button>
        <h1>Workout</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="page-content">
        <div className="workout-header">
          <div>
            <div className="workout-date">
              {new Date(workout.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {totalSets} sets ({workingSets} working)
            </div>
          </div>
        </div>

        {/* Warmup/Working Mode Toggle */}
        <div className="mode-toggle" ref={toggleRef}>
          <div className={`mode-toggle-slider ${setMode}`} />
          <button
            className={`mode-toggle-btn ${setMode === 'warmup' ? 'active' : ''}`}
            onClick={() => handleModeToggle('warmup')}
          >
            🔥 Warmup
          </button>
          <button
            className={`mode-toggle-btn ${setMode === 'working' ? 'active' : ''}`}
            onClick={() => handleModeToggle('working')}
          >
            💪 Working
          </button>
        </div>

        {/* Exercise List */}
        {workout.exercises.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏋️</div>
            <p className="empty-state-text">
              No exercises yet.
              <br />
              Tap "Add Exercise" to get started.
            </p>
          </div>
        ) : (
          workout.exercises.map((entry) => (
            <ExerciseCard
              key={entry.id}
              entry={entry}
              weightInputs={weightInputs}
              repsInputs={repsInputs}
              setWeightInputs={setWeightInputs}
              setRepsInputs={setRepsInputs}
              onAddSet={() => addSet(entry.id)}
              onRemoveSet={(setId) => removeSet(entry.id, setId)}
              onRemoveExercise={() => removeExercise(entry.id)}
            />
          ))
        )}

        {/* Add Exercise Button */}
        <button
          className="btn btn-secondary"
          style={{ marginTop: 8 }}
          onClick={() => setShowPicker(true)}
        >
          + Add Exercise
        </button>
      </div>

      {/* Finish Workout Button */}
      {workout.exercises.length > 0 && (
        <div className="finish-workout">
          <button className="btn btn-primary" onClick={onFinish}>
            ✓ Finish Workout
          </button>
        </div>
      )}
    </div>
  );
}

interface ExerciseCardProps {
  entry: ExerciseEntry;
  weightInputs: Record<string, string>;
  repsInputs: Record<string, string>;
  setWeightInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setRepsInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onRemoveExercise: () => void;
}

function ExerciseCard({
  entry,
  weightInputs,
  repsInputs,
  setWeightInputs,
  setRepsInputs,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: ExerciseCardProps) {
  const weightKey = `${entry.id}-weight`;
  const repsKey = `${entry.id}-reps`;

  return (
    <div className="exercise-card">
      <div className="exercise-header">
        <div>
          <div className="exercise-name">{entry.exerciseName}</div>
          <div className="exercise-muscle">
            {entry.primaryMuscleGroup}
            {entry.secondaryMuscleGroups.length > 0 && (
              <span style={{ opacity: 0.6 }}> + {entry.secondaryMuscleGroups.join(', ')}</span>
            )}
          </div>
        </div>
        <button
          className="set-delete"
          onClick={onRemoveExercise}
          style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
        >
          ✕
        </button>
      </div>

      {/* Sets list */}
      {entry.sets.length > 0 && (
        <div className="sets-list">
          {entry.sets.map((set, idx) => (
            <div key={set.id} className={`set-row ${set.type}`}>
              <div className="set-number">{idx + 1}</div>
              <div className="set-details">
                <span className="set-weight">{set.weight > 0 ? `${set.weight} kg` : '—'}</span>
                <span className="set-reps"> × {set.reps} reps</span>
                {set.type === 'warmup' && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--warmup)', marginLeft: 6 }}>
                    warmup
                  </span>
                )}
              </div>
              <button className="set-delete" onClick={() => onRemoveSet(set.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add set form */}
      <div className="set-input-form">
        <div className="set-input-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            className="set-input"
            placeholder="0"
            value={weightInputs[weightKey] || ''}
            onChange={(e) =>
              setWeightInputs((prev) => ({ ...prev, [weightKey]: e.target.value }))
            }
            min="0"
            step="0.5"
          />
        </div>
        <div className="set-input-group">
          <label>Reps</label>
          <input
            type="number"
            className="set-input"
            placeholder="0"
            value={repsInputs[repsKey] || ''}
            onChange={(e) =>
              setRepsInputs((prev) => ({ ...prev, [repsKey]: e.target.value }))
            }
            min="0"
          />
        </div>
        <button className="btn-add-set" onClick={onAddSet}>
          + Set
        </button>
      </div>
    </div>
  );
}
