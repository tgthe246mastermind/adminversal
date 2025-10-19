import React, { useState } from 'react';
import { Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

function Profile() {
    const [socialAccounts, setSocialAccounts] = useState([
        { platform: 'Instagram', handle: '@scarlett_creative', status: 'connected' },
        { platform: 'Twitter', handle: '@scarlettj', status: 'connected' },
        { platform: 'LinkedIn', handle: 'scarlett-johnson', status: 'connected' },
        { platform: 'YouTube', handle: 'ScarCreative', status: 'disconnected' }
    ]);

    const handleInstagramLogin = () => {
        // Instagram OAuth Authorization URL
        const authUrl = `https://api.instagram.com/oauth/authorize?client_id=1234567890&redirect_uri=https://yourapp.com/auth/instagram/callback&scope=user_profile,user_media&response_type=code`;
        
        // Open in new tab/window
        window.open(authUrl, '_blank', 'width=500,height=600');
    };

    const handleToggleConnection = (platform) => {
        const account = socialAccounts.find(acc => acc.platform === platform);
        if (platform === 'Instagram' && account.status === 'disconnected') {
            handleInstagramLogin();
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to disconnect your ${platform} account?`
        );

        if (confirmed) {
            setSocialAccounts(prevAccounts =>
                prevAccounts.map(account =>
                    account.platform === platform
                        ? { ...account, status: 'disconnected' }
                        : account
                )
            );
        }
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
                <div className="profile-sections">
                    <div className="profile-section">
                        <h3>Personal Information</h3>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input className="profile-input" type="text" />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input className="profile-input" type="email" />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input className="profile-input" type="tel" />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input className="profile-input" type="text" />
                        </div>
                    </div>
                    <div className="profile-section">
                        <h3>Social Accounts</h3>
                        <div className="social-accounts">
                            {socialAccounts.map(account => (
                                <div key={account.platform} className="social-account">
                                    {account.platform === 'Instagram' && <Instagram size={20} color="#667eea" />}
                                    {account.platform === 'Twitter' && <Twitter size={20} color="#667eea" />}
                                    {account.platform === 'LinkedIn' && <Linkedin size={20} color="#667eea" />}
                                    {account.platform === 'YouTube' && <Youtube size={20} color="#667eea" />}
                                    <span>{account.handle}</span>
                                    <span className={`status ${account.status}`}>
                                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                                    </span>
                                    {account.platform === 'Instagram' && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleToggleConnection(account.platform)}
                                            style={{ marginLeft: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                        >
                                            {account.status === 'connected' ? 'Disconnect' : 'Connect'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
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