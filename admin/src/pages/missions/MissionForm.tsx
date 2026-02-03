import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function MissionForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        type: 'DAILY',
        description: '',
        reward_exp: 10,
        reward_points: 5,
        target_value: 1,
        target_unit: 'times',
        required_level: 1,
        duration_days: 1,
        is_active: true,
        presets: [{ label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchMission();
        }
    }, [id]);

    const fetchMission = async () => {
        try {
            const response = await api.get(`/mission/${id}`);
            const m = response.data.data;

            // Ensure 3 preset slots
            const loadedPresets = Array.isArray(m.presets) ? m.presets : [];
            const formPresets = [0, 1, 2].map(i => loadedPresets[i] || { label: '', value: '' });

            setFormData({
                title: m.missionName,
                type: m.missionType,
                description: m.description || '',
                reward_exp: m.rewardExp,
                reward_points: m.rewardPoints,
                target_value: m.targetValue,
                target_unit: m.targetUnit,
                required_level: m.requiredLevel,
                duration_days: m.durationDays || 1,
                is_active: m.isActive,
                presets: formPresets
            });
        } catch (err) {
            console.error(err);
            setError('Failed to fetch mission details');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (['reward_exp', 'reward_points', 'target_value', 'required_level', 'duration_days'].includes(name)) {
            setFormData({ ...formData, [name]: parseInt(value) || 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    };

    const handlePresetChange = (index: number, field: 'label' | 'value', value: string) => {
        const newPresets: any[] = [...formData.presets];
        newPresets[index][field] = value;
        setFormData({ ...formData, presets: newPresets });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Filter out empty presets (where value is empty)
            const cleanedPresets = formData.presets
                .filter((p: any) => p.value.toString().trim() !== '')
                .map((p: any) => ({
                    label: p.label,
                    value: Number(p.value)
                }));

            const payload = { ...formData, presets: cleanedPresets };

            if (isEditMode) {
                await api.put(`/mission/${id}`, payload);
            } else {
                await api.post('/mission', payload);
            }
            navigate('/missions');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save mission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1 className="page-header">
                {isEditMode ? 'Edit Mission' : 'Create New Mission'}
            </h1>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-card">
                <div className="form-grid">

                    {/* Row 1 */}
                    <div className="form-group col-span-2">
                        <label className="form-label">Mission Title</label>
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
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="DAILY">Daily</option>
                            <option value="CHALLENGE">Challenge</option>
                        </select>
                    </div>

                    {/* Row 2 */}
                    <div className="form-group">
                        <label className="form-label">Required Level</label>
                        <input
                            type="number"
                            name="required_level"
                            value={formData.required_level}
                            onChange={handleChange}
                            min="1"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Target Value</label>
                        <input
                            type="number"
                            name="target_value"
                            value={formData.target_value}
                            onChange={handleChange}
                            min="1"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Unit</label>
                        <input
                            type="text"
                            name="target_unit"
                            value={formData.target_unit}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g. steps"
                        />
                    </div>

                    {/* Row 3 */}
                    <div className="form-group">
                        <label className="form-label">Duration (Days)</label>
                        <input
                            type="number"
                            name="duration_days"
                            value={formData.duration_days}
                            onChange={handleChange}
                            min="1"
                            disabled={formData.type === 'DAILY'}
                            className="form-input"
                            style={{ backgroundColor: formData.type === 'DAILY' ? '#f3f4f6' : '#ffffff', opacity: formData.type === 'DAILY' ? 0.7 : 1 }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Reward EXP ✨</label>
                        <input
                            type="number"
                            name="reward_exp"
                            value={formData.reward_exp}
                            onChange={handleChange}
                            min="0"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Reward Points 💎</label>
                        <input
                            type="number"
                            name="reward_points"
                            value={formData.reward_points}
                            onChange={handleChange}
                            min="0"
                            className="form-input"
                        />
                    </div>

                    {/* Row 4 */}
                    <div className="form-group">
                        <label className="form-label" style={{ visibility: 'hidden' }}>Status</label>
                        <div style={{ display: 'flex', alignItems: 'center', height: '42px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 1rem' }}>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleCheckboxChange}
                                id="is_active"
                                style={{ width: '1.1rem', height: '1.1rem', marginRight: '0.75rem', accentColor: '#4f46e5', cursor: 'pointer' }}
                            />
                            <label htmlFor="is_active" style={{ color: '#111827', fontWeight: '600', cursor: 'pointer', marginBottom: 0, fontSize: '0.9rem' }}>Active</label>
                        </div>
                    </div>
                    <div className="form-group col-span-2">
                        <label className="form-label">Quick Measure Presets (Optional)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {formData.presets.map((preset: any, index: number) => (
                                <div key={index} style={{ padding: '0.75rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>
                                            Label (e.g. 250ml)
                                        </label>
                                        <input
                                            type="text"
                                            value={preset.label}
                                            onChange={(e) => handlePresetChange(index, 'label', e.target.value)}
                                            className="form-input"
                                            style={{ fontSize: '0.875rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>
                                            Value (e.g. 250)
                                        </label>
                                        <input
                                            type="number"
                                            value={preset.value}
                                            onChange={(e) => handlePresetChange(index, 'value', e.target.value)}
                                            className="form-input"
                                            style={{ fontSize: '0.875rem' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group col-span-2">
                        <label className="form-label">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Short description..."
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Saving...' : 'Save Mission'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/missions')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
