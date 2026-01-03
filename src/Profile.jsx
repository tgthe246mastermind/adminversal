// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Instagram, Twitter, Linkedin, Youtube, Facebook, Loader2, AlertCircle, Info, LogOut } from "lucide-react";

// Initialize Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Profile() {
    const API_BASE = import.meta.env.VITE_API_URL;

    // UI State for the specific static list
    const [socialAccounts, setSocialAccounts] = useState([
        { platform: 'Instagram', handle: 'Not Connected', status: 'disconnected', icon: Instagram, color: '#E4405F' },
        { platform: 'Twitter', handle: '@scarlettj', status: 'disconnected', icon: Twitter, color: '#1DA1F2' },
        { platform: 'LinkedIn', handle: 'scarlett-johnson', status: 'disconnected', icon: Linkedin, color: '#0A66C2' },
        { platform: 'YouTube', handle: 'ScarCreative', status: 'disconnected', icon: Youtube, color: '#FF0000' }
    ]);

    // Functional State (Backend Data)
    const [realAccounts, setRealAccounts] = useState([]); // Stores actual DB data
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState(''); // For "0 Pages Found" case
    const [success, setSuccess] = useState('');

    // 1. Fetch real connected accounts from Supabase
    const fetchAccounts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('connected_accounts')
            .select('*')
            .eq('user_id', user.id);

        if (!error && data) {
            setRealAccounts(data);
            
            // Update the UI list to show "Connected" if we have data
            if (data.length > 0) {
                setSocialAccounts(prev => prev.map(acc => 
                    acc.platform === 'Instagram' 
                    ? { ...acc, status: 'connected', handle: data[0].name } // Show first page name
                    : acc
                ));
            }
        }
        setLoading(false);
    };

    // 2. Handle Facebook/Instagram OAuth Callback
    useEffect(() => {
        const handleFacebookCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const tempId = params.get('fb_connect');
            const urlError = params.get('error');

            if (urlError) {
                setError(`Login cancelled or failed: ${urlError}`);
                window.history.replaceState({}, '', '/profile');
                return;
            }

            if (tempId) {
                setConnecting(true);
                setError('');
                setWarning('');
                
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error('No active session. Please log in again.');

                    const res = await fetch(`${API_BASE}/api/auth/facebook/finalize`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ temp_id: tempId }),
                    });

                    const result = await res.json();

                    if (!res.ok) throw new Error(result.error || 'Finalize failed');

                    // CRITICAL FIX: Check if pages were actually found
                    // If success is true but details (pages list) is empty, warn the user.
                    if (result.success && result.details && result.details.length === 0) {
                        setWarning('Login successful, but no Pages were found. Please try again and click "Edit Settings" to select your pages.');
                    } else if (result.success) {
                        setSuccess('Accounts connected successfully!');
                        fetchAccounts();
                    } else {
                        setError(result.error || 'Failed to connect.');
                    }
                } catch (err) {
                    setError(`Connection failed: ${err.message}`);
                } finally {
                    setConnecting(false);
                    window.history.replaceState({}, '', '/profile');
                }
            }
        };

        handleFacebookCallback();
        fetchAccounts();
    }, []);

    // 3. Trigger Facebook/Instagram Login
    const handleMetaLogin = () => {
        const state = crypto.randomUUID();
        sessionStorage.setItem('oauth_state', state);

        const params = new URLSearchParams({
            client_id: import.meta.env.VITE_FB_APP_ID,
            redirect_uri: `${API_BASE}/api/auth/facebook/callback`,
            // UPDATED SCOPE: Added 'business_management' to fix your fallback error
            scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,instagram_basic,instagram_content_publish,instagram_manage_messages,email,business_management',
            response_type: 'code',
            state,
            auth_type: 'rerequest'
        });

        window.location.href = `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`;
    };

    const handleDisconnect = async (platform) => {
        if (platform !== 'Instagram') {
            alert("Demo only: This platform is not wired to the backend yet.");
            return;
        }

        if (!confirm("Disconnect all Facebook/Instagram accounts?")) return;
        
        // Optimistic UI update
        setSocialAccounts(prev => prev.map(acc => 
            acc.platform === 'Instagram' ? { ...acc, status: 'disconnected', handle: 'Not Connected' } : acc
        ));
        setRealAccounts([]);

        // You would typically call a backend DELETE endpoint here
        // await fetch(`${API_BASE}/api/auth/facebook/disconnect`, ...);
    };

    return (
        <div className="tab-content active" id="profile">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar-large">S</div>
                    <div className="profile-info">
                        <h2>Scarlett Johnson</h2>
                        <div className="profile-username">@scarlett_j</div>
                        <p className="profile-bio">Social Media Strategist & Content Creator. Helping brands grow their online presence through data-driven insights.</p>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="profile-stat">
                        <div className="stat-value">127</div>
                        <div className="stat-label">Campaigns</div>
                    </div>
                    <div className="profile-stat">
                        <div className="stat-value">24.7K</div>
                        <div className="stat-label">Total Reach</div>
                    </div>
                    <div className="profile-stat">
                        <div className="stat-value">8.4%</div>
                        <div className="stat-label">Avg. Engagement</div>
                    </div>
                    <div className="profile-stat">
                        <div className="stat-value">95%</div>
                        <div className="stat-label">Success Rate</div>
                    </div>
                </div>

                {/* Status Messages Area */}
                <div style={{ padding: '0 2rem' }}>
                    {warning && (
                        <div style={{ padding: '1rem', background: '#fff7ed', color: '#c2410c', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Info size={18} /> {warning}
                        </div>
                    )}
                    {error && (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ padding: '1rem', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '1rem' }}>
                            {success}
                        </div>
                    )}
                </div>

                <div className="profile-sections">
                    <div className="profile-section">
                        <h3>Personal Information</h3>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input className="profile-input" type="text" defaultValue="Scarlett Johnson" />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input className="profile-input" type="email" defaultValue="scarlett@example.com" />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input className="profile-input" type="tel" />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input className="profile-input" type="text" defaultValue="New York, USA" />
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3>Social Accounts</h3>
                        <div className="social-accounts">
                            {socialAccounts.map(account => (
                                <div key={account.platform} className="social-account">
                                    <account.icon size={20} color={account.color} />
                                    <span>{account.handle}</span>
                                    <span className={`status ${account.status}`}>
                                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                                    </span>
                                    
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            if (account.status === 'connected') {
                                                handleDisconnect(account.platform);
                                            } else {
                                                if (account.platform === 'Instagram') {
                                                    handleMetaLogin();
                                                } else {
                                                    alert("Integration coming soon!");
                                                }
                                            }
                                        }}
                                        disabled={connecting && account.platform === 'Instagram'}
                                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                    >
                                        {connecting && account.platform === 'Instagram' ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            account.status === 'connected' ? 'Disconnect' : 'Connect'
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Real connected pages list (from DB) */}
                        {realAccounts.length > 0 && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <small style={{ color: '#64748b', fontWeight: 'bold' }}>Active Data Connections:</small>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                                    {realAccounts.map(acc => (
                                        <li key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                            {acc.name} ({acc.instagram_username ? 'IG Business' : 'FB Page'})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="profile-actions">
                    <button className="btn btn-primary">Save Changes</button>
                    <button className="btn btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default Profile;
