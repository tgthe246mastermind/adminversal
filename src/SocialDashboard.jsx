import React, { useState } from 'react';
import { Instagram, Facebook } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok } from '@fortawesome/free-brands-svg-icons';

function SocialDashboard() {
    const [currentPlatform, setCurrentPlatform] = useState("Instagram");

    const platforms = ["Instagram", "Facebook", "TikTok"];

    const platformData = {
        Instagram: {
            followers: "1.2M",
            engagement: "4.2%",
            posts: 45,
            changes: {
                followers: "+12.3%",
                engagement: "+2.1%",
                posts: "Same"
            }
        },
        Facebook: {
            followers: "850K",
            engagement: "3.8%",
            posts: 32,
            changes: {
                followers: "+8.5%",
                engagement: "-0.5%",
                posts: "+5"
            }
        },
        TikTok: {
            followers: "2.5M",
            engagement: "6.1%",
            posts: 20,
            changes: {
                followers: "+18.4%",
                engagement: "+3.0%",
                posts: "+2"
            }
        }
    };

    const currentStats = platformData[currentPlatform];

    const nextPlatform = () => {
        const idx = platforms.indexOf(currentPlatform);
        setCurrentPlatform(platforms[(idx + 1) % platforms.length]);
    };

    const prevPlatform = () => {
        const idx = platforms.indexOf(currentPlatform);
        setCurrentPlatform(platforms[(idx - 1 + platforms.length) % platforms.length]);
    };

    const PlatformIcon = ({ platform }) => {
        switch (platform) {
            case "Instagram":
                return <Instagram size={36} color="#667eea" />;
            case "Facebook":
                return <Facebook size={36} color="#667eea" />;
            case "TikTok":
                return <FontAwesomeIcon icon={faTiktok} size="2x" color="#000" />;
            default:
                return null;
        }
    };

    const getChangeClass = (change) => {
        if (change === "Same") return "neutral";
        if (change.startsWith('+')) return "positive";
        if (change.startsWith('-')) return "negative";
        return "neutral";
    };

    return (
        <div className="tab-content active" id="social-dashboard">
            {/* Slider Card */}
            <div className="slider-card-container">
                <div className="slider-card">
                    <button className="slider-arrow left" onClick={prevPlatform}>←</button>
                    <div className="platform-icon">
                        <PlatformIcon platform={currentPlatform} />
                    </div>
                    <button className="slider-arrow right" onClick={nextPlatform}>→</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="dashboard-grid">
                <div className="stats-card">
                    <h3>Total Followers</h3>
                    <div className="stat-number">{currentStats.followers}</div>
                    <div className={`stat-change ${getChangeClass(currentStats.changes.followers)}`}>
                        {currentStats.changes.followers}
                    </div>
                </div>
                <div className="stats-card">
                    <h3>Engagement Rate</h3>
                    <div className="stat-number">{currentStats.engagement}</div>
                    <div className={`stat-change ${getChangeClass(currentStats.changes.engagement)}`}>
                        {currentStats.changes.engagement}
                    </div>
                </div>
                <div className="stats-card">
                    <h3>Posts This Week</h3>
                    <div className="stat-number">{currentStats.posts}</div>
                    <div className={`stat-change ${getChangeClass(currentStats.changes.posts)}`}>
                        {currentStats.changes.posts}
                    </div>
                </div>
            </div>

            {/* Inline CSS */}
            <style jsx>{`
                .slider-card-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 25px;
                }

                .slider-card {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f3f4f6;
                    padding: 15px 25px;
                    border-radius: 14px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .slider-arrow {
                    background: none;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    padding: 0 12px;
                    color: #333;
                }

                .slider-arrow:hover {
                    color: #667eea;
                }

                .platform-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 12px;
                }

                .dashboard-grid {
                    display: flex;
                    justify-content: center;
                    gap: 25px;
                    flex-wrap: wrap;
                }

                .stats-card {
                    background: #fff;
                    padding: 25px 30px;
                    border-radius: 14px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    text-align: center;
                    min-width: 500px;
                }

                .stats-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 10px;
                }

                .stat-number {
                    font-size: 2.25rem;
                    font-weight: bold;
                    margin: 8px 0;
                }

                .stat-change {
                    font-size: 1.25rem;
                }

                .stat-change.positive { color: green; }
                .stat-change.negative { color: red; }
                .stat-change.neutral { color: gray; }
            `}</style>
        </div>
    );
}

export default SocialDashboard;
