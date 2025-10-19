// Updated Settings.jsx
import React from 'react';

function Settings() {
    return (
        <div className="tab-content active" id="settings">
            <div className="settings-container">
                <div className="settings-section">
                    <h3>Account Settings</h3>
                    <div className="settings-group">
                        <div className="setting-item">
                            <label>Email Notifications</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="email-notifications" />
                                <span className="slider"></span>
                            </div>
                        </div>
                        <div className="setting-item">
                            <label>Push Notifications</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="push-notifications" />
                                <span className="slider"></span>
                            </div>
                        </div>
                        <div className="setting-item">
                            <label>Auto-post Schedule</label>
                            <select className="setting-select">
                                <option>Every 4 hours</option>
                                <option>Twice daily</option>
                                <option>Daily</option>
                                <option>Custom</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="settings-section">
                    <h3>Privacy Settings</h3>
                    <div className="settings-group">
                        <div className="setting-item">
                            <label>Profile Visibility</label>
                            <select className="setting-select">
                                <option>Public</option>
                                <option>Private</option>
                                <option>Friends Only</option>
                            </select>
                        </div>
                        <div className="setting-item">
                            <label>Data Analytics</label>
                            <div className="toggle-switch">
                                <input type="checkbox" id="data-analytics" />
                                <span className="slider"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="settings-section">
                    <h3>Appearance</h3>
                    <div className="settings-group">
                        <div className="setting-item">
                            <label>Theme</label>
                            <select className="setting-select">
                                <option>Light</option>
                                <option>Dark</option>
                                <option>Auto</option>
                            </select>
                        </div>
                        <div className="setting-item">
                            <label>Language</label>
                            <select className="setting-select">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>German</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;