import React from 'react';
import { BarChart2, Edit, Users } from "lucide-react";

function BetaFeatures() {
    return (
        <div className="tab-content active" id="beta">
            <div className="feature-grid">
                <div className="feature-card">
                    <div className="feature-icon"><BarChart2 size={24} color="white" /></div>
                    <h3>AI-Powered Analytics</h3>
                    <p>Get insights from advanced AI algorithms analyzing your social media performance</p>
                    <span className="beta-badge">Beta</span>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Edit size={24} color="white" /></div>
                    <h3>Smart Content Creation</h3>
                    <p>Generate engaging content with AI assistance tailored to your audience</p>
                    <span className="beta-badge">Beta</span>
                </div>
                <div className="feature-card">
                    <div className="feature-icon"><Users size={24} color="white" /></div>
                    <h3>Audience Insights</h3>
                    <p>Deep dive into your audience demographics and behavior patterns</p>
                    <span className="beta-badge">Beta</span>
                </div>
            </div>
        </div>
    );
}

export default BetaFeatures;