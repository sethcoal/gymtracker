import { useMemo } from 'react';
import { Workout, MuscleGroupTarget } from '../types';
import { MUSCLE_GROUPS } from '../data/exercises';

interface MuscleTrackerPageProps {
  workouts: Workout[];
  targets: MuscleGroupTarget[];
  onBack: () => void;
  onUpdateTargets: (targets: MuscleGroupTarget[]) => void;
}

export default function MuscleTrackerPage({ workouts, targets, onBack, onUpdateTargets }: MuscleTrackerPageProps) {
  // Get the start of the current week (Sunday)
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const weekStart = getWeekStart();

  // Count working sets per muscle group this week (primary + secondary)
  const weeklyVolume = useMemo(() => {
    const volume: Record<string, number> = {};
    MUSCLE_GROUPS.forEach((mg) => {
      volume[mg] = 0;
    });

    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      if (workoutDate >= weekStart) {
        workout.exercises.forEach((exercise) => {
          const workingSets = exercise.sets.filter((s) => s.type === 'working').length;
          // Count toward primary muscle group
          volume[exercise.primaryMuscleGroup] = (volume[exercise.primaryMuscleGroup] || 0) + workingSets;
          // Count toward secondary muscle groups
          exercise.secondaryMuscleGroups.forEach((mg) => {
            volume[mg] = (volume[mg] || 0) + workingSets;
          });
        });
      }
    });

    return volume;
  }, [workouts, weekStart]);

  const updateTarget = (muscleGroup: string, newTarget: number) => {
    const updated = targets.map((t) =>
      t.muscleGroup === muscleGroup ? { ...t, targetSets: Math.max(0, newTarget) } : t
    );
    onUpdateTargets(updated);
  };

  const totalHit = MUSCLE_GROUPS.filter((mg) => {
    const target = targets.find((t) => t.muscleGroup === mg);
    const targetSets = target?.targetSets ?? 3;
    return (weeklyVolume[mg] || 0) >= targetSets;
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="header">
        <button className="header-back" onClick={onBack}>←</button>
        <h1>Muscle Tracker</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="page-content">
        <p className="tracker-intro">
          Track your <strong>minimum effective dose</strong> — the minimum number of working sets
          per muscle group each week to maintain and build strength. Only{' '}
          <strong>working sets</strong> count toward these targets. Sets count toward both primary
          and secondary muscle groups.
        </p>

        {/* Summary */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>This Week</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
                {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
                {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                {totalHit}/{MUSCLE_GROUPS.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>targets hit</div>
            </div>
          </div>
        </div>

        {/* Muscle group cards */}
        {MUSCLE_GROUPS.map((mg) => {
          const target = targets.find((t) => t.muscleGroup === mg);
          const targetSets = target?.targetSets ?? 3;
          const currentSets = weeklyVolume[mg] || 0;
          const isDone = currentSets >= targetSets;
          const progress = Math.min(currentSets / targetSets, 1);

          return (
            <div key={mg} className="muscle-group-card">
              <div className="muscle-group-header">
                <span className="muscle-group-name">{mg}</span>
                <div className={`muscle-group-check ${isDone ? 'done' : 'pending'}`}>
                  {isDone ? '✓' : '○'}
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className={`progress-fill ${isDone ? 'done' : 'pending'}`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <div className="muscle-group-stats">
                <span>
                  {currentSets} / {targetSets} working sets
                </span>
                <div className="target-input-group">
                  <span style={{ fontSize: '0.75rem' }}>Target:</span>
                  <input
                    type="number"
                    className="target-input"
                    value={targetSets}
                    onChange={(e) => updateTarget(mg, parseInt(e.target.value, 10) || 0)}
                    min="0"
                  />
                  <span style={{ fontSize: '0.75rem' }}>sets</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Info card */}
        <div className="card" style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>💡 How it works</div>
          <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8 }}>
            <li>
              <strong>Warmup sets</strong> prepare your muscles but don't count toward your weekly target.
            </li>
            <li>
              <strong>Working sets</strong> are the sets that count — the ones close to failure.
            </li>
            <li>
              Sets count toward <strong>both primary and secondary</strong> muscle groups (e.g., deadlifts count for Back, Glutes, Legs, Core, and Forearms).
            </li>
            <li>
              Hit your target for a muscle group and it gets a <strong>✓ check</strong> for the week.
            </li>
            <li>
              Adjust targets per muscle group based on your goals and recovery capacity.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
