import { useState, useMemo } from 'react';
import { Workout } from '../types';

interface CalendarPageProps {
  workouts: Workout[];
  onBack: () => void;
  onDeleteWorkout: (id: string) => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage({ workouts, onBack, onDeleteWorkout }: CalendarPageProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const workoutDates = useMemo(() => {
    const map = new Map<string, Workout[]>();
    workouts.forEach((w) => {
      const d = new Date(w.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    });
    return map;
  }, [workouts]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const selectedWorkouts = selectedDate
    ? workoutDates.get(selectedDate) || []
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="header">
        <button className="header-back" onClick={onBack}>←</button>
        <h1>Calendar</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="page-content">
        {/* Month navigation */}
        <div className="calendar-header">
          <button className="calendar-nav" onClick={prevMonth}>‹</button>
          <div className="calendar-month">
            {MONTHS[viewMonth]} {viewYear}
          </div>
          <button className="calendar-nav" onClick={nextMonth}>›</button>
        </div>

        {/* Day headers */}
        <div className="calendar-grid">
          {DAYS.map((d) => (
            <div key={d} className="calendar-day-header">{d}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="calendar-grid">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = `${viewYear}-${viewMonth}-${day}`;
            const hasWorkout = workoutDates.has(key);
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;

            return (
              <div
                key={key}
                className={`calendar-day ${hasWorkout ? 'has-workout' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(isSelected ? null : key)}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Selected date workout details */}
        {selectedDate && (
          <div>
            {selectedWorkouts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p className="empty-state-text">No workouts on this day</p>
              </div>
            ) : (
              selectedWorkouts.map((workout) => (
                <div key={workout.id} className="workout-detail">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div className="workout-detail-date">
                      {new Date(workout.date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                    <button
                      className="set-delete"
                      onClick={() => {
                        if (confirm('Delete this workout?')) {
                          onDeleteWorkout(workout.id);
                          setSelectedDate(null);
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                  {workout.exercises.map((exercise) => (
                    <div key={exercise.id} className="workout-exercise">
                      <div className="workout-exercise-name">{exercise.exerciseName}</div>
                      <div className="workout-exercise-sets">
                        {exercise.sets.map((set, idx) => (
                          <div key={set.id}>
                            Set {idx + 1}: {set.weight > 0 ? `${set.weight}kg` : 'BW'} × {set.reps}
                            {set.type === 'warmup' ? ' (warmup)' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* Quick stats */}
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>This Month</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {workouts.filter((w) => {
              const d = new Date(w.date);
              return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
            }).length} workouts completed
          </div>
        </div>
      </div>
    </div>
  );
}
