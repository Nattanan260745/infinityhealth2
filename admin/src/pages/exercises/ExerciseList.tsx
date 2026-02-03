import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Exercise {
    id: number;
    title: string;
    type: string;
    difficulty: string;
    videoUrl?: string; // Expecting this from backend now
}

export default function ExerciseList() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const response = await api.get('/exercise');
            setExercises(response.data.data);
        } catch (error) {
            console.error('Failed to fetch exercises', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this exercise?')) {
            try {
                await api.delete(`/exercise/${id}`);
                setExercises(exercises.filter(ex => ex.id !== id));
            } catch (error) {
                console.error('Failed to delete exercise', error);
                alert('Failed to delete exercise');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>Exercise Management</h1>
                <Link
                    to="/exercises/new"
                    style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}
                >
                    + Add Exercise
                </Link>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>ID</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Title</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Type</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Difficulty</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{}}>
                        {exercises.map((exercise) => (
                            <tr key={exercise.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#6b7280' }}>{exercise.id}</td>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontWeight: '500', color: '#111827' }}>{exercise.title}</td>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#6b7280', textTransform: 'capitalize' }}>{exercise.type}</td>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        backgroundColor:
                                            ['easy', 'beginner'].includes(exercise.difficulty) ? '#d1fae5' :
                                                ['medium', 'intermediate'].includes(exercise.difficulty) ? '#fef3c7' : '#fee2e2',
                                        color:
                                            ['easy', 'beginner'].includes(exercise.difficulty) ? '#065f46' :
                                                ['medium', 'intermediate'].includes(exercise.difficulty) ? '#92400e' : '#b91c1c'
                                    }}>
                                        {exercise.difficulty}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', textAlign: 'right', fontSize: '0.875rem' }}>
                                    <Link to={`/exercises/edit/${exercise.id}`} style={{ color: '#4f46e5', marginRight: '1rem', textDecoration: 'none' }}>Edit</Link>
                                    <button
                                        onClick={() => handleDelete(exercise.id)}
                                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {exercises.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    No exercises found. Add one to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
