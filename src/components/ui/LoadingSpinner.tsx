// src/components/ui/LoadingSpinner.tsx

import React from 'react';
import '../../styles/LoadingSpinner.css'; // Importeer de CSS

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string; // Optioneel om te gebruiken voor inline style of een custom klasse
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'var(--color-primary)' }) => {
    // We gebruiken de size prop om de CSS klasse te bepalen
    const sizeClass = size || 'md';

    // De kleur wordt inline ingesteld voor flexibiliteit, maar de spin-animatie komt van CSS
    const spinnerStyle = {
        borderColor: `#E5E7EB`, // Default light gray for the body
        borderRightColor: color,
        borderBottomColor: color,
    };

    return (
        <div className="spinner-container">
            <div
                className={`spinner ${sizeClass}`}
                style={spinnerStyle}
                role="status"
            >
            </div>
        </div>
    );
};

export default LoadingSpinner;