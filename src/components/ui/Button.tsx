// src/components/ui/Button.tsx

import React from 'react';
import '../../styles/Button.css'; // Importeer de CSS

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
                                           // ✅ Haal de 'type' prop expliciet op en geef het een veilige standaardwaarde.
                                           // Dit zorgt ervoor dat de 'type="submit"' van LoginPage wordt gebruikt,
                                           // of anders 'button' (wat geen formulier indient).
                                           type = 'button',
                                           variant = 'primary',
                                           isLoading = false,
                                           children,
                                           className = '',
                                           disabled, // Haal disabled ook expliciet op
                                           ...rest // Vang de rest van de props op (zoals onClick, id, etc.)
                                       }) => {
    // Combineer de basisklasse met de variant-klasse en eventuele custom klassen
    const buttonClasses = `button button-${variant} ${className}`;

    return (
        <button
            // ✅ Geef de type prop door
            type={type}
            className={buttonClasses}
            disabled={isLoading || disabled}
            {...rest} // Geef de rest van de props door (inclusief onClick)
        >
            {isLoading ? (
                // Eenvoudige loading spinner (gebruikt de 'spinner' klasse uit Button.css)
                <svg className="spinner" viewBox="0 0 24 24">
                    {/* SVG pad voor de spinner */}
                </svg>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;