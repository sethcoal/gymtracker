import { useState, useMemo } from 'react';
import { Workout } from '../types';
import { getExerciseById } from '../data/exercises';

interface ExerciseDetailPageProps {
  exerciseId: string;
  workouts: Workout[];
  onBack: () => void;
}

type GraphMetric =
  | 'estimated-1rm'
  | 'max-weight'
  | 'max-reps'
  | 'max-set-volume'
  | 'max-weight-for-reps'
  | 'total-workout-volume'
  | 'total-workout-reps';

const METRIC_LABELS: Record<GraphMetric, string> = {
  'estimated-1rm': 'Estimated 1RM (kg)',
  'max-weight': 'Max Weight (kg)',
  'max-reps': 'Max Reps',
  'max-set-volume': 'Max Set Volume (kg)',
  'max-weight-for-reps': 'Max Weight for Reps (kg)',
  'total-workout-volume': 'Total Workout Volume (kg)',
  'total-workout-reps': 'Total Workout Reps',
};

// Epley formula for estimated 1RM
function estimate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export default function ExerciseDetailPage({ exerciseId, workouts, onBack }: ExerciseDetailPageProps) {
  const [selectedMetric, setSelectedMetric] = useState<GraphMetric>('estimated-1rm');
  const [repsFilter, setRepsFilter] = useState<number>(0); // 0 = any reps

  const exercise = getExerciseById(exerciseId);

  // Get all workouts that include this exercise, sorted by date
  const exerciseWorkouts = useMemo(() => {
    return workouts
      .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, exerciseId]);

  // Calculate per-workout data points
  const workoutData = useMemo(() => {
    return exerciseWorkouts.map((workout) => {
      const entry = workout.exercises.find((e) => e.exerciseId === exerciseId);
      if (!entry) return null;

      const workingSets = entry.sets.filter((s) => s.type === 'working');

      // Filter by reps if needed
      const filteredSets = repsFilter > 0 ? workingSets.filter((s) => s.reps >= repsFilter) : workingSets;

      const maxWeight = Math.max(...workingSets.map((s) => s.weight), 0);
      const maxReps = Math.max(...workingSets.map((s) => s.reps), 0);
      const maxSetVolume = Math.max(...workingSets.map((s) => s.weight * s.reps), 0);
      const totalVolume = workingSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      const totalReps = workingSets.reduce((sum, s) => sum + s.reps, 0);

      // Estimated 1RM from the set with highest estimated 1RM
      const best1RMSet = workingSets.reduce((best, s) => {
        const est = estimate1RM(s.weight, s.reps);
        return est > (best ? estimate1RM(best.weight, best.reps) : 0) ? s : best;
      }, workingSets[0]);
      const estimated1RM = best1RMSet ? estimate1RM(best1RMSet.weight, best1RMSet.reps) : 0;

      // Max weight for reps (highest weight where reps >= repsFilter)
      const maxWeightForReps = repsFilter > 0
        ? Math.max(...filteredSets.map((s) => s.weight), 0)
        : maxWeight;

      return {
        date: new Date(workout.date),
        dateStr: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        maxWeight,
        maxReps,
        maxSetVolume,
        totalVolume,
        totalReps,
        estimated1RM,
        maxWeightForReps,
        workingSets,
      };
    }).filter(Boolean) as {
      date: Date;
      dateStr: string;
      maxWeight: number;
      maxReps: number;
      maxSetVolume: number;
      totalVolume: number;
      totalReps: number;
      estimated1RM: number;
      maxWeightForReps: number;
      workingSets: { weight: number; reps: number }[];
    }[];
  }, [exerciseWorkouts, repsFilter]);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    if (exerciseWorkouts.length === 0) return null;

    let totalWorkouts = 0;
    let totalWorkingSets = 0;
    let totalWorkingReps = 0;
    let totalVolume = 0;
    let maxWeight = 0;
    let maxWeightDate = '';
    let maxEstimated1RM = 0;
    let maxEstimated1RMDate = '';
    let maxRepsInSet = 0;
    let maxVolumeInSet = 0;
    let maxVolumeInWorkout = 0;

    // Personal records for 1RM, 2RM, 3RM, etc.
    const personalRecords: { reps: number; weight: number; date: string }[] = [];

    exerciseWorkouts.forEach((workout) => {
      const entry = workout.exercises.find((e) => e.exerciseId === exerciseId);
      if (!entry) return;

      totalWorkouts++;
      const workingSets = entry.sets.filter((s) => s.type === 'working');
      totalWorkingSets += workingSets.length;

      let workoutVolume = 0;
      workingSets.forEach((set) => {
        totalWorkingReps += set.reps;
        const volume = set.weight * set.reps;
        totalVolume += volume;
        workoutVolume += volume;

        if (set.weight > maxWeight) {
          maxWeight = set.weight;
          maxWeightDate = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        if (set.reps > maxRepsInSet) {
          maxRepsInSet = set.reps;
        }

        if (volume > maxVolumeInSet) {
          maxVolumeInSet = volume;
        }

        // Check personal records for 1RM, 2RM, 3RM, etc.
        for (let r = 1; r <= 10; r++) {
          if (set.reps === r) {
            const existing = personalRecords.find((pr) => pr.reps === r);
            if (!existing || set.weight > existing.weight) {
              if (existing) {
                existing.weight = set.weight;
                existing.date = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              } else {
                personalRecords.push({
                  reps: r,
                  weight: set.weight,
                  date: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                });
              }
            }
          }
        }
      });

      // Check estimated 1RM
      const best1RMSet = workingSets.reduce((best, s) => {
        const est = estimate1RM(s.weight, s.reps);
        return est > (best ? estimate1RM(best.weight, best.reps) : 0) ? s : best;
      }, workingSets[0]);

      if (best1RMSet) {
        const est1RM = estimate1RM(best1RMSet.weight, best1RMSet.reps);
        if (est1RM > maxEstimated1RM) {
          maxEstimated1RM = est1RM;
          maxEstimated1RMDate = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }

      if (workoutVolume > maxVolumeInWorkout) {
        maxVolumeInWorkout = workoutVolume;
      }
    });

    return {
      totalWorkouts,
      totalWorkingSets,
      totalWorkingReps,
      totalVolume,
      maxWeight,
      maxWeightDate,
      maxEstimated1RM,
      maxEstimated1RMDate,
      maxRepsInSet,
      maxVolumeInSet,
      maxVolumeInWorkout,
      personalRecords: personalRecords.sort((a, b) => a.reps - b.reps),
    };
  }, [exerciseWorkouts]);

  // Get graph data based on selected metric
  const graphData = useMemo(() => {
    return workoutData.map((d) => {
      let value = 0;
      switch (selectedMetric) {
        case 'estimated-1rm':
          value = d.estimated1RM;
          break;
        case 'max-weight':
          value = d.maxWeight;
          break;
        case 'max-reps':
          value = d.maxReps;
          break;
        case 'max-set-volume':
          value = d.maxSetVolume;
          break;
        case 'max-weight-for-reps':
          value = d.maxWeightForReps;
          break;
        case 'total-workout-volume':
          value = d.totalVolume;
          break;
        case 'total-workout-reps':
          value = d.totalReps;
          break;
      }
      return { date: d.dateStr, value };
    });
  }, [workoutData, selectedMetric]);

  if (!exercise) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="header">
          <button className="header-back" onClick={onBack}>←</button>
          <h1>Exercise Not Found</h1>
          <div style={{ width: 40 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="header">
        <button className="header-back" onClick={onBack}>←</button>
        <h1>{exercise.name}</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="page-content">
        {/* Exercise info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{exercise.name}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
            Primary: {exercise.primaryMuscleGroup}
            {exercise.secondaryMuscleGroups.length > 0 && ` | Secondary: ${exercise.secondaryMuscleGroups.join(', ')}`}
          </div>
        </div>

        {/* Stats section */}
        {stats && (
          <>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem' }}>📈 Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <StatItem label="Total Workouts" value={stats.totalWorkouts.toString()} />
                <StatItem label="Total Working Sets" value={stats.totalWorkingSets.toString()} />
                <StatItem label="Total Working Reps" value={stats.totalWorkingReps.toString()} />
                <StatItem label="Total Volume" value={`${stats.totalVolume.toLocaleString()} kg`} />
                <StatItem label="Max Weight" value={`${stats.maxWeight} kg`} sub={stats.maxWeightDate} />
                <StatItem label="Est. 1RM" value={`${stats.maxEstimated1RM.toFixed(1)} kg`} sub={stats.maxEstimated1RMDate} />
                <StatItem label="Max Reps (1 set)" value={stats.maxRepsInSet.toString()} />
                <StatItem label="Max Set Volume" value={`${stats.maxVolumeInSet} kg`} />
                <StatItem label="Max Workout Volume" value={`${stats.maxVolumeInWorkout.toLocaleString()} kg`} />
              </div>
            </div>

            {/* Personal Records */}
            {stats.personalRecords.length > 0 && (
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem' }}>🏆 Personal Records</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {stats.personalRecords.map((pr) => (
                    <div
                      key={pr.reps}
                      style={{
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        textAlign: 'center',
                        minWidth: 70,
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{pr.reps}RM</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{pr.weight} kg</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{pr.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Graph section */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem' }}>📊 Progress Graph</div>

          {/* Metric selector */}
          <div style={{ marginBottom: 12 }}>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as GraphMetric)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
            >
              <option value="estimated-1rm">Estimated 1RM (kg)</option>
              <option value="max-weight">Max Weight (kg)</option>
              <option value="max-reps">Max Reps</option>
              <option value="max-set-volume">Max Set Volume (kg)</option>
              <option value="max-weight-for-reps">Max Weight for Reps (kg)</option>
              <option value="total-workout-volume">Total Workout Volume (kg)</option>
              <option value="total-workout-reps">Total Workout Reps</option>
            </select>
          </div>

          {/* Reps filter */}
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Min reps:</span>
            <input
              type="number"
              min="0"
              max="20"
              value={repsFilter}
              onChange={(e) => setRepsFilter(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={{
                width: 60,
                padding: '6px 10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(0 = any)</span>
          </div>

          {/* Graph */}
          {graphData.length > 0 ? (
            <LineChart data={graphData} metricLabel={METRIC_LABELS[selectedMetric]} />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p className="empty-state-text">No data to graph yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

interface LineChartProps {
  data: { date: string; value: number }[];
  metricLabel: string;
}

function LineChart({ data, metricLabel }: LineChartProps) {
  if (data.length === 0) return null;

  const width = 400;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const valueRange = maxValue - minValue || 1;

  const xScale = (index: number) => padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
  const yScale = (value: number) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Create path for line
  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`)
    .join(' ');

  // Create area fill
  const areaPath = `${linePath} L ${xScale(data.length - 1)} ${yScale(minValue)} L ${xScale(0)} ${yScale(minValue)} Z`;

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => minValue + (valueRange / (yTicks - 1)) * i);

  // X-axis labels (show max 5)
  const xLabelInterval = Math.ceil(data.length / 5);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
        {/* Grid lines */}
        {yTickValues.map((val, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={yScale(val)}
              x2={width - padding.right}
              y2={yScale(val)}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={yScale(val) + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--text-secondary)"
            >
              {val.toFixed(val < 10 ? 1 : 0)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="rgba(74, 222, 128, 0.1)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xScale(i)} cy={yScale(d.value)} r="4" fill="var(--accent)" />
            <text
              x={xScale(i)}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              fontSize="9"
              fill="var(--text-secondary)"
            >
              {i % xLabelInterval === 0 ? d.date : ''}
            </text>
            {/* Tooltip on hover */}
            <title>{`${d.date}: ${d.value.toFixed(d.value < 10 ? 1 : 0)} ${metricLabel}`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}
