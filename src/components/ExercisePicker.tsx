import { useState } from 'react';
import { EXERCISES, MUSCLE_GROUPS, Exercise } from '../data/exercises';
import { generateId } from '../storage';

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export default function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? EXERCISES.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.primaryMuscleGroup.toLowerCase().includes(search.toLowerCase()) ||
          e.secondaryMuscleGroups.some((mg) => mg.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="header">
        <button className="header-back" onClick={onClose}>✕</button>
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

        {filtered ? (
          <div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p className="empty-state-text">No exercises found</p>
              </div>
            ) : (
              filtered.map((exercise) => (
                <div
                  key={exercise.id}
                  className="exercise-option"
                  onClick={() => onSelect(exercise)}
                >
                  <span className="exercise-option-name">{exercise.name}</span>
                  <span className="exercise-muscle">{exercise.primaryMuscleGroup}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          MUSCLE_GROUPS.map((mg) => (
            <div key={mg} className="muscle-group-section">
              <div className="muscle-group-title">{mg}</div>
              {EXERCISES.filter((e) => e.primaryMuscleGroup === mg || e.secondaryMuscleGroups.includes(mg)).map((exercise) => (
                <div
                  key={exercise.id}
                  className="exercise-option"
                  onClick={() => onSelect(exercise)}
                >
                  <span className="exercise-option-name">{exercise.name}</span>
                  <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>+</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
