// src/components/ui/StatusBadge.tsx

import React from 'react';
import '../../styles/StatusBadge.css'; // Importeer de CSS

interface StatusBadgeProps {
    status: string; // Bijv. 'LIVE', 'WAITING_FOR_CONTENT', 'PENDING'
}

// Functie om de juiste CSS-klasse te selecteren op basis van status
const getStatusClass = (status: string): string => {
    switch (status.toUpperCase().replace(/\s/g, '_')) {
        case 'LIVE':
        case 'COMPLETED':
        case 'PAID':
            return 'status-live';
        case 'IN_DESIGN':
        case 'DEVELOPMENT':
            return 'status-in_design';
        case 'WAITING_FOR_CONTENT':
        case 'NEEDS_REVIEW':
            return 'status-waiting_for_content';
        case 'CONCEPT':
        case 'PENDING':
        case 'OVERDUE':
            return 'status-pending';
        case 'STAGING':
            return 'status-staging';
        default:
            return 'status-default';
    }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusClass = getStatusClass(status);

    return (
        <span
            className={`status-badge ${statusClass}`}
        >
            {/* Vervang underscores door spaties voor weergave */}
            {status.replace(/_/g, ' ')}
        </span>
    );
};

export default StatusBadge;