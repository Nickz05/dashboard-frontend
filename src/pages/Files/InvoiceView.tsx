// src/pages/Files/InvoiceView.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/ui/StatusBadge';
import '../../styles/pages/InvoiceView.css';

// Dummy data voor facturen
const dummyInvoices = [
    { id: 1, number: 'INV-2025-001', amount: 1500.00, status: 'PAID', dueDate: '2025-10-30', fileUrl: '#' },
    { id: 2, number: 'INV-2025-002', amount: 3200.00, status: 'OVERDUE', dueDate: '2025-11-15', fileUrl: '#' },
    { id: 3, number: 'OFF-2025-003', amount: 4800.00, status: 'PENDING', dueDate: '2025-12-01', fileUrl: '#' },
];

const InvoiceView: React.FC = () => {
    return (
        <div className="invoice-view-container">
            <h1 className="page-title">Facturen & Financiële Documenten</h1>

            <div className="invoice-list">
                {dummyInvoices.map(invoice => (
                    <div key={invoice.id} className={`invoice-item ${invoice.status.toLowerCase()}`}>
                        <div>
                            <p className="font-medium">{invoice.number}</p>
                            <p className="text-sm text-gray-500">Vervaldatum: {invoice.dueDate}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="invoice-amount">€ {invoice.amount.toFixed(2)}</p>
                            <StatusBadge status={invoice.status} />
                            <a href={invoice.fileUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-700">
                                Download
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <Link to="/files" className="text-gray-500 hover:text-gray-700 font-medium">
                    ← Terug naar Bestanden Uploaden
                </Link>
            </div>
        </div>
    );
};

export default InvoiceView;