import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Unused
import api from '../../services/api';
import UserEditModal from './UserEditModal';

interface User {
    user_id: number;
    profile_img: string | null;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        role?: string;
    };
    level_id: number;
    points: number;
    exp?: number;
}

const UserList = () => {
    // const navigate = useNavigate(); // Removed unused
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/profile');
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to fetch users';
            setError(`Error: ${msg}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/profile/${userId}`);
                setUsers(users.filter(u => u.user_id !== userId));
            } catch (err) {
                console.error('Failed to delete user:', err);
                alert('Failed to delete user');
            }
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        fetchUsers();
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Users Management</h1>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151' }}>User</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151' }}>Email</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151' }}>Level</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151' }}>Points</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.user_id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {user.profile_img ? (
                                            <img
                                                src={user.profile_img}
                                                alt=""
                                                style={{ height: '2.5rem', width: '2.5rem', borderRadius: '50%', marginRight: '1rem' }}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40' }}
                                            />
                                        ) : (
                                            <div style={{ height: '2.5rem', width: '2.5rem', borderRadius: '50%', backgroundColor: '#E5E7EB', marginRight: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ color: '#6B7280', fontSize: '14px' }}>{user.user.firstName.charAt(0)}</span>
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                                                {user.user.firstName} {user.user.lastName}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#374151' }}>
                                    {user.user.email}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#374151' }}>
                                    <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.125rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                                        Lv. {user.level_id}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                                    {user.points?.toLocaleString()}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    <button
                                        onClick={() => handleEdit(user)}
                                        style={{ color: '#2563eb', cursor: 'pointer', border: 'none', background: 'none', marginRight: '1rem', fontWeight: 'bold' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.user_id)}
                                        style={{ color: '#dc2626', cursor: 'pointer', border: 'none', background: 'none' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && selectedUser && (
                <UserEditModal
                    user={selectedUser}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default UserList;
