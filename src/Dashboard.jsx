import React, { useState, useEffect } from 'react';
import { BarChart2, Bot, Settings, User, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import SocialDashboard from './SocialDashboard';
import SocialBots from './SocialBots';
import SettingsComponent from './Settings';
import Profile from './Profile';

// Initialize Supabase client
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Dashboard() {
    const [activeTab, setActiveTab] = useState('social-dashboard');
    const [stats, setStats] = useState({
        followers: '24.7K',
        engagement: '8.4%',
        posts: '15'
    });

    const tabData = {
        'social-dashboard': {
            title: 'Social Media Dashboard',
            subtitle: 'Monitor your social media performance'
        },
        'social-bots': {
            title: 'Social Media Bots',
            subtitle: 'Automated posting and scheduling'
        },
        'profile': {
            title: 'Profile',
            subtitle: 'Manage your personal information and social accounts'
        },
        'settings': {
            title: 'Settings',
            subtitle: 'Configure your preferences and account'
        }
    };

    // Logout handler
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            // Redirect to login or home page after clearing session
            window.location.href = '/'; 
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                followers: `${(parseFloat(prev.followers) + (Math.random() - 0.5) * 0.1).toFixed(1)}K`
            }));
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard">
            <style jsx>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Noto Sans', sans-serif; background: #f8fafc; color: #1e293b; }
                .dashboard { display: flex; height: 100vh; }
                .sidebar { 
                    width: 280px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 2rem 0; 
                    position: fixed; 
                    height: 100vh; 
                    display: flex;
                    flex-direction: column;
                }
                .sidebar-header { padding: 0 2rem 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
                .sidebar-nav { padding: 2rem 0; flex-grow: 1; }
                .nav-item { 
                    display: flex; 
                    align-items: center; 
                    padding: 1rem 2rem; 
                    cursor: pointer; 
                    transition: all 0.3s ease; 
                    border-left: 3px solid transparent; 
                }
                .nav-item:hover, .nav-item.active { background: rgba(255, 255, 255, 0.1); border-left-color: white; }
                .nav-item span { font-weight: 500; margin-left: 0.75rem; }
                
                .logout-section {
                    padding: 1rem 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .logout-btn {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-weight: 500;
                    padding: 0.75rem 0;
                    opacity: 0.8;
                    transition: opacity 0.3s;
                }
                .logout-btn:hover { opacity: 1; }
                .logout-btn span { margin-left: 0.75rem; }

                .main-content { flex: 1; margin-left: 280px; overflow-y: auto; }
                .header { background: white; padding: 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                .page-title { font-size: 2rem; font-weight: 600; }
                .user-profile { display: flex; align-items: center; gap: 0.75rem; }
                .avatar { width: 40px; height: 40px; background: #764ba2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
                .content { padding: 2rem; }

                @media (max-width: 768px) {
                    .sidebar { width: 100%; position: static; height: auto; }
                    .main-content { margin-left: 0; }
                    .dashboard { flex-direction: column; }
                }
            `}</style>

            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>AdminVersal</h2>
                </div>
                <nav className="sidebar-nav">
                    {Object.keys(tabData).map(tab => (
                        <div
                            key={tab}
                            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'social-dashboard' && <BarChart2 size={20} />}
                            {tab === 'social-bots' && <Bot size={20} />}
                            {tab === 'profile' && <User size={20} />}
                            {tab === 'settings' && <Settings size={20} />}
                            <span>{tabData[tab].title}</span>
                        </div>
                    ))}
                </nav>
                
                <div className="logout-section">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="header">
                    <div>
                        <h1 className="page-title">{tabData[activeTab].title}</h1>
                        <p style={{ color: '#64748b' }}>{tabData[activeTab].subtitle}</p>
                    </div>
                    <div className="user-profile">
                        <div className="avatar">S</div>
                        <span>Scarlett</span>
                    </div>
                </header>

                <div className="content">
                    {activeTab === 'social-dashboard' && <SocialDashboard stats={stats} />}
                    {activeTab === 'social-bots' && <SocialBots />}
                    {activeTab === 'profile' && <Profile />}
                    {activeTab === 'settings' && <SettingsComponent />}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
