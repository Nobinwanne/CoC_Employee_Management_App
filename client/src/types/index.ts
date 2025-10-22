export interface Employee {
    id: number;
    name: string;
    email: string;
    departmentId: number;
    createdAt?: string;
}

export interface Department {
    id: number;
    name: string;
    description: string;
}

export interface WorkUnit {
    id: number;
    name: string;
    departmentId: number;
}

export interface Organization {
    id: number;
    name: string;
    organizationId: number;
}