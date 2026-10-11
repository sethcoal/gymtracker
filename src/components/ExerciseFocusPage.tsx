import { useState, useMemo } from 'react';
import { Workout } from '../types';
import { EXERCISES, getExerciseById } from '../data/exercises';
import { loadFocusedExercises, saveFocusedExercises } from '../storage';

interface ExerciseFocusPageProps {
  workouts: Workout[];
  onBack: () => void;
  onSelectExercise: (exerciseId: string) => void;
}

export default function ExerciseFocusPage({ workouts, onBack, onSelectExercise }: ExerciseFocusPageProps) {
  const [focusedIds, setFocusedIds] = useState<string[]>(loadFocusedExercises());
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  // Get last 7 days
  const last7Days = useMemo(() => {
    const days: { date: Date; dateStr: string; dayLabel: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    return days;
  }, []);

  // Count working sets per exercise per day for last 7 days
  const dailySets = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    focusedIds.forEach((id) => {
      map[id] = {};
      last7Days.forEach((d) => {
        map[id][d.dateStr] = 0;
      });
    });

    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      const dateStr = workoutDate.toISOString().split('T')[0];
      if (last7Days.some((d) => d.dateStr === dateStr)) {
        workout.exercises.forEach((exercise) => {
          if (focusedIds.includes(exercise.exerciseId)) {
            const workingSets = exercise.sets.filter((s) => s.type === 'working').length;
            if (map[exercise.exerciseId]) {
              map[exercise.exerciseId][dateStr] = (map[exercise.exerciseId][dateStr] || 0) + workingSets;
            }
          }
        });
      }
    });

    return map;
  }, [workouts, focusedIds, last7Days]);

  const toggleFocus = (exerciseId: string) => {
    const updated = focusedIds.includes(exerciseId)
      ? focusedIds.filter((id) => id !== exerciseId)
      : [...focusedIds, exerciseId];
    setFocusedIds(updated);
    saveFocusedExercises(updated);
  };

  const filteredExercises = search.trim()
    ? EXERCISES.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.primaryMuscleGroup.toLowerCase().includes(search.toLowerCase())
      )
    : EXERCISES;

  if (showPicker) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="header">
          <button className="header-back" onClick={() => setShowPicker(false)}>✕</button>
          <h1>Add Exercise</h1>
          <div style={{ width: 40 }} />
        </div>
        <div className="page-content">
          <input
            type="text"
            className="exercise-picker-search"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {filteredExercises.map((exercise) => {
            const isFocused = focusedIds.includes(exercise.id);
            return (
              <div
                key={exercise.id}
                className="exercise-option"
                onClick={() => toggleFocus(exercise.id)}
                style={isFocused ? { borderColor: 'var(--accent)' } : {}}
              >
                <span className="exercise-option-name">{exercise.name}</span>
                <span style={{ color: isFocused ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {isFocused ? '✓ Added' : '+ Add'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="header">
        <button className="header-back" onClick={onBack}>←</button>
        <h1>Exercise Focus</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="page-content">
        <p className="tracker-intro">
          Select exercises you're currently concentrating on. Track your working sets over the
          last 7 days for each one.
        </p>

        {focusedIds.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <p className="empty-state-text">
              No exercises selected.
              <br />
              Tap "Add Exercise" to choose exercises to focus on.
            </p>
          </div>
        ) : (
          focusedIds.map((id) => {
            const exercise = getExerciseById(id);
            if (!exercise) return null;
            const sets = dailySets[id] || {};
            const totalSets = Object.values(sets).reduce((a, b) => a + b, 0);

            return (
              <div key={id} className="muscle-group-card">
                <div className="muscle-group-header">
                  <div>
                    <span className="muscle-group-name">{exercise.name}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {exercise.primaryMuscleGroup}
                      {exercise.secondaryMuscleGroups.length > 0 && ` + ${exercise.secondaryMuscleGroups.join(', ')}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => onSelectExercise(id)}
                    >
                      📊 Stats
                    </button>
                    <button
                      className="set-delete"
                      onClick={() => toggleFocus(id)}
                      style={{ fontSize: '1rem' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 7-day rolling calendar */}
                <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                  {last7Days.map((d) => {
                    const count = sets[d.dateStr] || 0;
                    const isToday = d.dateStr === new Date().toISOString().split('T')[0];
                    return (
                      <div
                        key={d.dateStr}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '8px 4px',
                          borderRadius: 'var(--radius-sm)',
                          background: count > 0 ? 'rgba(74, 222, 128, 0.15)' : 'var(--bg-input)',
                          border: isToday ? '1px solid var(--accent)' : '1px solid var(--border)',
                        }}
                      >
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{d.dayLabel}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: count > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {totalSets} working sets in last 7 days
                </div>
              </div>
            );
          })
        )}

        <button
          className="btn btn-secondary"
          style={{ marginTop: 8 }}
          onClick={() => setShowPicker(true)}
        >
          + Add Exercise
        </button>
      </div>
    </div>
  );
}
