export interface Employee {
    Id: number;
    FirstName: string;
    LastName: string;
    EmployeeId: number;
    Email: string;
    EmployeeLogin: string;
    Title: string;
    Step: number;
    Level: number;
    ReportingLevel: number;
    DateEmployed: string;
    Supervisor: string;
    SupervisorId: number;
    ManagerId: number;
    Manager: string;
    IsSupervisor: boolean;
    IsManager: boolean;
    IsPDRRequired: boolean;
    IsLFLicRequired: boolean;
    IsWorksiteRequired: boolean;
    Status: boolean;
    WorkUnitId: number;
    CreatedAt?: string;
}

export interface WorkUnit {
    Id: number;
    WorkUnitName: string;
    Description: string;
    DepartmentId: number;
    Department: string;
}

export interface Department {
    Id: number;
    DepartmentName: string;
    Description: string;
    OrganizationId: number;
    Organization: string;
}

export interface Organization {
    Id: number;
    OrganizationName: string;
    Description: string;
}

export interface User {
    Id: number;
    UserFirstName: string;
    UserLastName: string;
    UserEmail: string;
    UserLogin: string;
    UserTitle: string;
}