import React, { useState, useEffect } from 'react';
import { BarChart2, Bot, Settings, User } from 'lucide-react';
import SocialDashboard from './SocialDashboard';
import SocialBots from './SocialBots';
import SettingsComponent from './Settings';
import Profile from './Profile';

function Dashboard() {
    const [activeTab, setActiveTab] = useState('social-dashboard');
    const [stats, setStats] = useState({
        followers: '24.7K',
        engagement: '8.4%',
        posts: '15'
    });

    // Tab data for Social Media Dashboard, Social Media Bots, Profile, and Settings
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

    // Simulated real-time stats update
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
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Noto Sans', sans-serif;
                    background: #f8fafc;
                    color: #1e293b;
                }
                .dashboard {
                    display: flex;
                    height: 100vh;
                }
                .sidebar {
                    width: 280px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem 0;
                    position: fixed;
                    height: 100vh;
                    overflow-y: auto;
                }
                .sidebar-header {
                    padding: 0 2rem 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .sidebar-header h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                }
                .sidebar-nav {
                    padding: 2rem 0;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 1rem 2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-left: 3px solid transparent;
                }
                .nav-item:hover,
                .nav-item.active {
                    background: rgba(255, 255, 255, 0.1);
                    border-left-color: white;
                }
                .nav-item i {
                    margin-right: 0.75rem;
                    width: 20px;
                    height: 20px;
                }
                .nav-item span {
                    font-weight: 500;
                }
                .main-content {
                    flex: 1;
                    margin-left: 280px;
                    overflow-y: auto;
                }
                .header {
                    background: white;
                    padding: 2rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .page-title {
                    font-size: 2rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                .page-subtitle {
                    color: #64748b;
                }
                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .avatar {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                }
                .content {
                    padding: 2rem;
                }
                .tab-content {
                    display: none;
                }
                .tab-content.active {
                    display: block;
                }
                .settings-container {
                    max-width: 800px;
                }
                .settings-section {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .settings-section h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    color: #374151;
                }
                .settings-group {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .setting-item label {
                    font-weight: 500;
                    color: #374151;
                }
                .setting-select {
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    background: white;
                    font-size: 0.875rem;
                    min-width: 150px;
                }
                .toggle-switch {
                    position: relative;
                    width: 50px;
                    height: 24px;
                }
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 24px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: #667eea;
                }
                input:checked + .slider:before {
                    transform: translateX(26px);
                }
                .profile-container {
                    max-width: 1000px;
                }
                .profile-header {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    display: flex;
                    gap: 2rem;
                    align-items: center;
                }
                .profile-avatar-large {
                    width: 120px;
                    height: 120px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3rem;
                    font-weight: 600;
                    flex-shrink: 0;
                }
                .profile-info h2 {
                    font-size: 2rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                .profile-username {
                    color: #667eea;
                    font-weight: 500;
                    margin-bottom: 1rem;
                }
                .profile-bio {
                    color: #64748b;
                    line-height: 1.6;
                }
                .profile-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .profile-stat {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }
                .stat-label {
                    color: #64748b;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                .profile-sections {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                .profile-section {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .profile-section h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    color: #374151;
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #374151;
                }
                .profile-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    transition: border-color 0.3s ease;
                }
                .profile-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                .social-accounts {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .social-account {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .social-account i {
                    width: 20px;
                    height: 20px;
                    color: #667eea;
                }
                .social-account span:first-of-type {
                    flex: 1;
                    font-weight: 500;
                }
                .status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .status.connected {
                    background: #d1fae5;
                    color: #065f46;
                }
                .status.disconnected {
                    background: #fee2e2;
                    color: #991b1b;
                }
                .profile-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }
                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                .btn-secondary {
                    background: #f1f5f9;
                    color: #64748b;
                }
                .btn-secondary:hover {
                    background: #e2e8f0;
                }
                @media (max-width: 768px) {
                    .sidebar {
                        width: 100%;
                        position: static;
                        height: auto;
                    }
                    .main-content {
                        margin-left: 0;
                    }
                    .dashboard {
                        flex-direction: column;
                    }
                    .header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    .profile-header {
                        flex-direction: column;
                        text-align: center;
                    }
                    .profile-sections {
                        grid-template-columns: 1fr;
                    }
                    .profile-actions {
                        justify-content: center;
                    }
                    .setting-item {
                        flex-direction: column;
                        gap: 0.5rem;
                        align-items: flex-start;
                    }
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
                            data-tab={tab}
                        >
                            {tab === 'social-dashboard' && <BarChart2 size={20} />}
                            {tab === 'social-bots' && <Bot size={20} />}
                            {tab === 'profile' && <User size={20} />}
                            {tab === 'settings' && <Settings size={20} />}
                            <span>{tabData[tab].title}</span>
                        </div>
                    ))}
                </nav>
            </aside>
            <main className="main-content">
                <header className="header">
                    <div>
                        <h1 className="page-title">{tabData[activeTab].title}</h1>
                        <p className="page-subtitle">{tabData[activeTab].subtitle}</p>
                    </div>
                    <div className="user-profile">
                        <div className="avatar">S</div>
                        <span>Scarlett</span>
                    </div>
                </header>
                <div className="content" style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
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