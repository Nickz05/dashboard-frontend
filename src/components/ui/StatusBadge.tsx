// src/components/ui/StatusBadge.tsx

import React from 'react';
import { ProjectStatus } from '../../types/project';
import '../../styles/StatusBadge.css';

interface StatusBadgeProps {
    status: ProjectStatus;
    size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const getStatusConfig = (status: ProjectStatus) => {
        const configs = {
            [ProjectStatus.CONCEPT]: {
                label: 'Concept',
                className: 'status-concept',
                icon: '📝'
            },
            [ProjectStatus.IN_DESIGN]: {
                label: 'In Design',
                className: 'status-design',
                icon: '🎨'
            },
            [ProjectStatus.WAITING_FOR_CONTENT]: {
                label: 'Wacht op Content',
                className: 'status-waiting',
                icon: '⏳'
            },
            [ProjectStatus.DEVELOPMENT]: {
                label: 'In Development',
                className: 'status-development',
                icon: '⚡'
            },
            [ProjectStatus.STAGING]: {
                label: 'Staging',
                className: 'status-staging',
                icon: '🚀'
            },
            [ProjectStatus.LIVE]: {
                label: 'Live',
                className: 'status-live',
                icon: '✅'
            }
        };

        return configs[status] || { label: status, className: 'status-default', icon: '•' };
    };

    const config = getStatusConfig(status);

    return (
        <span className={`status-badge status-${size} ${config.className}`}>
            <span className="status-icon">{config.icon}</span>
            <span className="status-label">{config.label}</span>
        </span>
    );
};

export default StatusBadge;