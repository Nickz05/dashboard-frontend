// src/types/globals.d.ts

// Global type definition voor omgevingsvariabelen
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Voeg hier andere VITE_ variablen toe indien nodig
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}