import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { label: 'Missions', path: '/missions' },
        { label: 'Exercises', path: '/exercises' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: '#1f2937',
                color: 'white',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>InfinityHealth</h2>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Admin Panel</p>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {menuItems.map((item) => (
                            <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                                <Link
                                    to={item.path}
                                    style={{
                                        display: 'block',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.375rem',
                                        color: location.pathname === item.path ? 'white' : '#d1d5db',
                                        backgroundColor: location.pathname === item.path ? '#374151' : 'transparent',
                                        textDecoration: 'none',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Profile & Logout */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid #374151' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                        Logged in as: <strong>{user?.fullName || 'Admin'}</strong>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '2rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
