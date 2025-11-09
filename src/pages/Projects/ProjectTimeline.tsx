// src/pages/Projects/ProjectTimeline.tsx

import React from 'react';
import '../../styles/pages/ProjectTimeline.css'; // Importeer de CSS

interface ProjectTimelineProps {
    timelineText: string | null;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ timelineText }) => {
    if (!timelineText) {
        return <p className="text-gray-500 italic">De gedetailleerde projectfasering is nog niet vastgesteld.</p>;
    }

    const steps = timelineText.split('\n').filter(line => line.trim().length > 0);

    return (
        <div className="timeline-container">
            {steps.length > 0 ? (
                <ol className="timeline-list">
                    {steps.map((step, index) => (
                        <li key={index} className="timeline-item">
                            <span className="timeline-item-icon">
                                {/* SVG for the dot/icon */}
                                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="10" />
                                </svg>
                            </span>
                            <p className="timeline-item-text">{step.trim()}</p>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="whitespace-pre-wrap text-sm text-gray-700">{timelineText}</p>
            )}
        </div>
    );
};

export default ProjectTimeline;