// src/components/ui/Input.tsx

import React from 'react';
import '../../styles/Input.css'; // Importeer de CSS

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    // Bepaal de veldklasse op basis van de error prop
    const fieldClasses = `input-field ${error ? 'error' : ''} ${className}`;

    return (
        <div className="input-group">
            {label && (
                <label htmlFor={props.id || props.name} className="input-label">
                    {label}
                </label>
            )}
            <input
                className={fieldClasses}
                {...props}
            />
            {error && (
                <p className="input-error-message">{error}</p>
            )}
        </div>
    );
};

export default Input;