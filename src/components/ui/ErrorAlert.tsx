import React from 'react';
import '../../styles/ErrorAlert.css';

interface ErrorAlertProps {
    message: string;
}

// ✅ Vertaalmap voor veelvoorkomende errors
const errorTranslations: Record<string, string> = {
    "Invalid credentials": "Onjuiste inloggegevens",
    "Login mislukt": "Inloggen mislukt",
    "An error occurred during login": "Er is een fout opgetreden bij het inloggen",
    "User not found": "Gebruiker niet gevonden",
    "Network Error": "Netwerkfout, controleer uw internetverbinding",
    // Password reset errors
    "Invalid or expired reset token": "Ongeldige of verlopen reset link",
    "Password must be at least 8 characters long": "Wachtwoord moet minimaal 8 karakters lang zijn",
    "An error occurred while processing your request": "Er is een fout opgetreden bij het verwerken van uw verzoek",
    "An error occurred while resetting your password": "Er is een fout opgetreden bij het resetten van uw wachtwoord",
};

/**
 * Een herbruikbare UI-component om foutmeldingen op een opvallende manier weer te geven.
 * @param {string} message - De foutboodschap die getoond moet worden.
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
    if (!message) return null;

    // ✅ Probeer vertaling te vinden, anders gebruik originele message
    const translatedMessage = errorTranslations[message] || message;

    return (
        <div className="error-alert" role="alert">
            <span className="error-alert-icon">⚠️</span>
            <p className="error-alert-message">
                <strong>Oeps!</strong> {translatedMessage}
            </p>
        </div>
    );
};

export default ErrorAlert;