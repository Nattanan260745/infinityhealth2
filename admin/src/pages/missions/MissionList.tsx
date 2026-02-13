import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Mission {
    id: number;
    missionName: string;
    missionType: string;
    targetValue: number;
    targetUnit: string;
    rewardExp: number;
    rewardPoints: number;
    isActive: boolean;
}

export default function MissionList() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        try {
            const response = await api.get('/mission', { params: { includeInactive: true } });
            setMissions(response.data.data);
        } catch (error) {
            console.error('Failed to fetch missions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this mission?')) {
            try {
                await api.delete(`/mission/${id}`);
                setMissions(missions.filter(m => m.id !== id));
            } catch (error) {
                console.error('Failed to delete mission', error);
                alert('Failed to delete mission');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>Mission Management</h1>
                <Link
                    to="/missions/new"
                    style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}
                >
                    + Add Mission
                </Link>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>

                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Name</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Type</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Target</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Rewards</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Status</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {missions.map((mission) => (
                            <tr key={mission.id} style={{ borderTop: '1px solid #e5e7eb' }}>

                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontWeight: '500', color: '#111827' }}>{mission.missionName}</td>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#6b7280' }}>
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        backgroundColor: mission.missionType === 'DAILY' ? '#dbeafe' : '#fce7f3',
                                        color: mission.missionType === 'DAILY' ? '#1e40af' : '#9d174d'
                                    }}>
                                        {mission.missionType}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#6b7280' }}>
                                    {mission.targetValue} {mission.targetUnit}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#6b7280' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.75rem' }}>EXP: {mission.rewardExp}</span>
                                        <span style={{ fontSize: '0.75rem' }}>Pts: {mission.rewardPoints}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', color: '#6b7280' }}>
                                    {mission.isActive ? (
                                        <span style={{ color: '#10b981', fontWeight: '500' }}>Active</span>
                                    ) : (
                                        <span style={{ color: '#ef4444', fontWeight: '500' }}>Inactive</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', textAlign: 'right', fontSize: '0.875rem' }}>
                                    <Link to={`/missions/edit/${mission.id}`} style={{ color: '#4f46e5', marginRight: '1rem', textDecoration: 'none' }}>Edit</Link>
                                    <button
                                        onClick={() => handleDelete(mission.id)}
                                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
