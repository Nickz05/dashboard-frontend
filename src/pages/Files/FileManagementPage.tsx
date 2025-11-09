// src/pages/Files/FileManagementPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import { useFiles } from '../../contexts/FileContext';
import '../../styles/pages/FileManagementPage.css';

// Dummy data voor bestanden
const dummyFiles = [
    { id: 1, name: 'Logo_HighRes.png', type: 'Afbeelding', uploadedBy: 'CLIENT', date: '2025-11-01' },
    { id: 2, name: 'Homepagina_Tekst.docx', type: 'Document', uploadedBy: 'CLIENT', date: '2025-11-03' },
    { id: 3, name: 'Offerte_V3.pdf', type: 'PDF', uploadedBy: 'ZD', date: '2025-10-25' },
];

const FileManagementPage: React.FC = () => {
    const [isUploading, setIsUploading] = useState(false);

    // const { files, uploadFile, isLoading } = useFiles();

    const handleFileUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        // Simuleer upload
        setIsUploading(true);
        console.log(`Uploading ${files[0].name}...`);

        setTimeout(() => {
            setIsUploading(false);
            alert(`Bestand ${files[0].name} is geüpload.`);
        }, 1500);

        // In een echte app:
        // uploadFile(files[0]);
    };

    return (
        <div className="file-management-container">
            <h1 className="page-title">Bestanden & Content Beheer</h1>

            {/* Upload Zone (User Story IV.1) */}
            <div
                className={`dropzone ${isUploading ? 'is-uploading' : ''}`}
                onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('fileInput')?.click()}
            >
                {isUploading ? (
                    <p>Bezig met uploaden...</p>
                ) : (
                    <>
                        <p className="font-semibold text-lg">Sleep bestanden hierheen of klik om te uploaden.</p>
                        <p className="text-sm text-gray-500">Max. 50MB per bestand (Logo's, teksten, afbeeldingen)</p>
                    </>
                )}
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files)}
                />
            </div>

            <h2 className="text-xl font-semibold mb-4">Geleverde Bestanden ({dummyFiles.length})</h2>

            {/* Bestandslijst */}
            <div className="file-grid">
                {dummyFiles.map(file => (
                    <div key={file.id} className="file-card">
                        <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">Door: {file.uploadedBy} op {file.date}</p>
                        </div>
                        <Link to="#" className="text-yellow-600 hover:text-yellow-700">
                            Download
                        </Link>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-4 border-t">
                <Link to="/invoice-view" className="text-yellow-600 hover:text-yellow-700 font-medium">
                    Bekijk Facturen & Offertes →
                </Link>
            </div>
        </div>
    );
};

export default FileManagementPage;