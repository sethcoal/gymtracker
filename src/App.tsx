import { useState, useEffect, useCallback } from 'react';
import { Page, Workout, MuscleGroupTarget } from './types';
import { loadWorkouts, saveWorkouts, loadTargets, saveTargets } from './storage';
import HomePage from './components/HomePage';
import WorkoutPage from './components/WorkoutPage';
import CalendarPage from './components/CalendarPage';
import MuscleTrackerPage from './components/MuscleTrackerPage';
import ExerciseFocusPage from './components/ExerciseFocusPage';
import ExerciseDetailPage from './components/ExerciseDetailPage';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [targets, setTargets] = useState<MuscleGroupTarget[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  useEffect(() => {
    setWorkouts(loadWorkouts());
    setTargets(loadTargets());
  }, []);

  const persistWorkouts = useCallback((newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
    saveWorkouts(newWorkouts);
  }, []);

  const persistTargets = useCallback((newTargets: MuscleGroupTarget[]) => {
    setTargets(newTargets);
    saveTargets(newTargets);
  }, []);

  const startNewWorkout = useCallback(() => {
    const workout: Workout = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      exercises: [],
    };
    setActiveWorkout(workout);
    setPage('workout');
  }, []);

  const finishWorkout = useCallback(() => {
    if (activeWorkout && activeWorkout.exercises.length > 0) {
      const newWorkouts = [...workouts, activeWorkout];
      persistWorkouts(newWorkouts);
    }
    setActiveWorkout(null);
    setPage('home');
  }, [activeWorkout, workouts, persistWorkouts]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
    setPage('home');
  }, []);

  const deleteWorkout = useCallback((workoutId: string) => {
    const newWorkouts = workouts.filter((w) => w.id !== workoutId);
    persistWorkouts(newWorkouts);
  }, [workouts, persistWorkouts]);

  const openExerciseDetail = useCallback((exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setPage('exercise-detail');
  }, []);

  return (
    <>
      {page === 'home' && (
        <HomePage
          onStartWorkout={startNewWorkout}
          onOpenCalendar={() => setPage('calendar')}
          onOpenTracker={() => setPage('tracker')}
          onOpenExerciseFocus={() => setPage('exercise-focus')}
        />
      )}
      {page === 'workout' && activeWorkout && (
        <WorkoutPage
          workout={activeWorkout}
          setWorkout={setActiveWorkout}
          onFinish={finishWorkout}
          onCancel={cancelWorkout}
        />
      )}
      {page === 'calendar' && (
        <CalendarPage
          workouts={workouts}
          onBack={() => setPage('home')}
          onDeleteWorkout={deleteWorkout}
        />
      )}
      {page === 'tracker' && (
        <MuscleTrackerPage
          workouts={workouts}
          targets={targets}
          onBack={() => setPage('home')}
          onUpdateTargets={persistTargets}
        />
      )}
      {page === 'exercise-focus' && (
        <ExerciseFocusPage
          workouts={workouts}
          onBack={() => setPage('home')}
          onSelectExercise={openExerciseDetail}
        />
      )}
      {page === 'exercise-detail' && selectedExerciseId && (
        <ExerciseDetailPage
          exerciseId={selectedExerciseId}
          workouts={workouts}
          onBack={() => setPage('exercise-focus')}
        />
      )}

      {/* Bottom navigation */}
      {page === 'home' && (
        <nav className="bottom-nav">
          <button className="bottom-nav-btn active" onClick={() => setPage('home')}>
            <span className="bottom-nav-icon">🏠</span>
            Home
          </button>
          <button className="bottom-nav-btn" onClick={() => setPage('calendar')}>
            <span className="bottom-nav-icon">📅</span>
            Calendar
          </button>
          <button className="bottom-nav-btn" onClick={() => setPage('exercise-focus')}>
            <span className="bottom-nav-icon">🎯</span>
            Focus
          </button>
          <button className="bottom-nav-btn" onClick={() => setPage('tracker')}>
            <span className="bottom-nav-icon">📊</span>
            Tracker
          </button>
        </nav>
      )}
    </>
  );
}
