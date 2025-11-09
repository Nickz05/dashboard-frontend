// src/types/user.ts

export type Role = 'ADMIN' | 'CLIENT';

export interface User {
    id: number;
    email: string;
    name: string;
    role: Role;
    mustChangePassword: boolean;
}

export interface DecodedToken {
    id: number;
    email: string;
    role: Role;
    iat: number;
    exp: number;
}