interface HomePageProps {
  onStartWorkout: () => void;
  onOpenCalendar: () => void;
  onOpenTracker: () => void;
  onOpenExerciseFocus: () => void;
}

export default function HomePage({ onStartWorkout, onOpenCalendar, onOpenTracker, onOpenExerciseFocus }: HomePageProps) {
  return (
    <div className="home-container">
      <div className="home-logo">💪</div>
      <h1 className="home-title">FitTrack</h1>
      <p className="home-subtitle">
        Simple workout logging with minimum effective dose tracking
      </p>
      <div className="home-buttons">
        <button className="btn btn-primary" onClick={onStartWorkout}>
          🏋️ Start New Workout
        </button>
        <button className="btn btn-secondary" onClick={onOpenCalendar}>
          📅 Calendar
        </button>
        <button className="btn btn-secondary" onClick={onOpenExerciseFocus}>
          🎯 Exercise Focus
        </button>
        <button className="btn btn-secondary" onClick={onOpenTracker}>
          📊 Muscle Tracker
        </button>
      </div>
    </div>
  );
}
