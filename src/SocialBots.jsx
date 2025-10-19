import React, { useState } from 'react';
import { Instagram, Facebook, Upload } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok } from '@fortawesome/free-brands-svg-icons';

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

function SocialBots() {
    const platforms = ["Instagram", "Facebook", "TikTok"];
    const [currentPlatform, setCurrentPlatform] = useState(platforms[0]);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const availableTimes = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM'];

    // State to track approval status for each slot
    const [approvals, setApprovals] = useState(
        days.reduce((acc, day) => ({
            ...acc,
            [day]: Array(5).fill('pending') // Initialize each slot as 'pending'
        }), {})
    );

    const nextPlatform = () => {
        const idx = platforms.indexOf(currentPlatform);
        setCurrentPlatform(platforms[(idx + 1) % platforms.length]);
    };

    const prevPlatform = () => {
        const idx = platforms.indexOf(currentPlatform);
        setCurrentPlatform(platforms[(idx - 1 + platforms.length) % platforms.length]);
    };

    const handleApprove = (day, index) => {
        setApprovals(prev => ({
            ...prev,
            [day]: prev[day].map((status, i) =>
                i === index ? 'approved' : status
            )
        }));
    };

    return (
        <div className="tab-content active" id="social-bots">
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
            <div className="bot-schedule">
                <h3>Automated Posting Schedule for {currentPlatform}</h3>
                {days.map((day) => (
                    <div key={day} className="day-section">
                        <h4 className="day-header">{day}</h4>
                        <div className="slots-container">
                            {[...Array(5)].map((_, index) => (
                                <div key={`${day}-${index}`} className="slot-card">
                                    <div className="slot-upload">
                                        <Upload size={24} color="#667eea" />
                                    </div>
                                    <input
                                        type="text"
                                        className="slot-caption"
                                        placeholder="Enter post caption..."
                                    />
                                    <select className="slot-time">
                                        {availableTimes.map((time, idx) => (
                                            <option key={idx} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className={`btn approve-btn ${approvals[day][index] === 'approved' ? 'approved' : ''}`}
                                        onClick={() => handleApprove(day, index)}
                                        disabled={approvals[day][index] === 'approved'}
                                    >
                                        {approvals[day][index] === 'approved' ? 'Approved' : 'Approve'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Inline CSS for Slider, Slots, and Approve Button */}
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

                .bot-schedule {
                    max-height: calc(100vh - 200px);
                    overflow-y: auto;
                    padding-bottom: 20px;
                }

                .day-section {
                    margin-bottom: 30px;
                }

                .day-header {
                    font-size: 1.5rem;
                    font-weight: 600;
                    text-align: center;
                    margin: 15px 0;
                    color: #333;
                }

                .slots-container {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-top: 10px;
                }

                .slot-card {
                    display: flex;
                    align-items: center;
                    background: #fff;
                    padding: 10px 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    height: 50px;
                    width: 700px;
                    margin: 0 auto;
                }

                .slot-upload {
                    margin-right: 15px;
                    display: flex;
                    align-items: center;
                }

                .slot-caption {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    font-size: 14px;
                    margin-right: 15px;
                }

                .slot-time {
                    padding: 8px;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    font-size: 14px;
                    width: 120px;
                    margin-right: 15px;
                }

                .approve-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: #667eea;
                    color: white;
                }

                .approve-btn:hover:not(:disabled) {
                    background: #5a6bd6;
                    transform: translateY(-1px);
                }

                .approve-btn.approved {
                    background: #10b981;
                    cursor: default;
                }

                .approve-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default SocialBots;