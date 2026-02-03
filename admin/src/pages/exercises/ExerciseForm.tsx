import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';



export default function ExerciseForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        // Internal state for form
        majorType: 'cardio', // 'cardio' or 'weight'
        subType: 'full_body', // 'full_body', 'upper_body', 'lower_body', 'core'
        difficulty: 'beginner',
        video_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchExercise();
        }
    }, [id]);

    const fetchExercise = async () => {
        try {
            const response = await api.get(`/exercise/${id}`);
            const ex = response.data.data;

            // Parse existing type
            let maj = 'cardio';
            let sub = 'full_body';

            if (ex.type === 'cardio') {
                maj = 'cardio';
            } else if (ex.type.startsWith('weight')) {
                maj = 'weight';
                // Extract suffix if present, e.g. weight_upper_body -> upper_body
                const parts = ex.type.split('weight_');
                if (parts.length > 1 && parts[1]) {
                    sub = parts[1];
                }
            } else {
                // Fallback for legacy 'weight' (no suffix)
                if (ex.type === 'weight') maj = 'weight';
            }

            setFormData({
                title: ex.title,
                description: ex.description || '',
                majorType: maj,
                subType: sub,
                difficulty: ex.difficulty,
                video_url: ex.videoUrl || ''
            });
        } catch (err) {
            console.error(err);
            setError('Failed to fetch exercise details');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Construct backend type
            let finalType = formData.majorType;
            if (formData.majorType === 'weight') {
                finalType = `weight_${formData.subType}`;
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                type: finalType,
                difficulty: formData.difficulty,
                video_url: formData.video_url
            };

            if (isEditMode) {
                await api.put(`/exercise/${id}`, payload);
            } else {
                await api.post('/exercise', payload);
            }
            navigate('/exercises');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save exercise');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1 className="page-header" style={{ color: "#000000ff" }}>
                {isEditMode ? 'Edit Exercise' : 'Add New Exercise'}
            </h1>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-card">
                <div className="form-grid">

                    {/* Row 1: Title (Full Width) */}
                    <div className="form-group col-span-3">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="form-input"
                            placeholder="e.g. Morning Jog"
                        />
                    </div>

                    {/* Row 2: Description (Full Width) */}
                    <div className="form-group col-span-3">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="form-textarea"
                            placeholder="Short description..."
                        />
                    </div>

                    {/* Row 3: Type & Difficulty */}
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <select
                            name="majorType"
                            value={formData.majorType}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="cardio">Cardio</option>
                            <option value="weight">Weight Training</option>
                        </select>
                    </div>

                    {formData.majorType === 'weight' && (
                        <div className="form-group">
                            <label className="form-label">Target Zone</label>
                            <select
                                name="subType"
                                value={formData.subType}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="full_body">Full Body</option>
                                <option value="upper_body">Upper Body</option>
                                <option value="lower_body">Lower Body</option>
                                <option value="core">Core</option>
                            </select>
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Difficulty</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div className="form-group">
                        {/* Empty spacer or third column if needed, but 2 items look fine if grid is 3 cols? 
                             Wait, App.css grid is 3 cols.
                             If I want 2 items side-by-side filling the row, I might need to span them differently or leave a gap.
                             Let's stick to 2 items + 1 empty or span?
                             MissionForm used col-span-2 for some.
                             Let's make these span 1.5? No, grid doesn't work like that easily.
                             Let's make them Span 1 each, and maybe the Video URL span 3.
                          */}
                    </div>

                    {/* Row 4: Video URL (Full Width) */}
                    <div className="form-group col-span-3">
                        <label className="form-label">Video URL (YouTube Embed Link)</label>
                        <input
                            type="text"
                            name="video_url"
                            value={formData.video_url}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g., https://www.youtube.com/embed/dQw4w9WgXcQ"
                        />
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                            Use the "Embed" URL from YouTube (e.g. https://www.youtube.com/embed/VIDEO_ID)
                        </p>
                    </div>

                </div>

                <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Saving...' : 'Save Exercise'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/exercises')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
