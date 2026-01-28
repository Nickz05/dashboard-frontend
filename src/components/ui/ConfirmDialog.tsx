// src/components/ui/ConfirmDialog.tsx

import React from 'react';
import '../../styles/ConfirmDialog.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'primary' | 'warning';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                         isOpen,
                                                         title,
                                                         message,
                                                         confirmText = 'Bevestigen',
                                                         cancelText = 'Annuleren',
                                                         onConfirm,
                                                         onCancel,
                                                         variant = 'danger'
                                                     }) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                    color: 'white'
                };
            case 'primary':
                return {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                };
            case 'warning':
                return {
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white'
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                    color: 'white'
                };
        }
    };

    return (
        <div className="confirm-dialog-overlay" onClick={onCancel}>
            <div className="confirm-dialog-content" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-dialog-header">
                    <h3 className="confirm-dialog-title">{title}</h3>
                </div>

                <div className="confirm-dialog-body">
                    <p className="confirm-dialog-message">{message}</p>
                </div>

                <div className="confirm-dialog-footer">
                    <button
                        onClick={onCancel}
                        className="confirm-dialog-button confirm-dialog-cancel"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="confirm-dialog-button confirm-dialog-confirm"
                        style={getVariantStyles()}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;