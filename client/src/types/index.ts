export interface Employee {
    Id: string;
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
    SupervisorId: string;
    ManagerId: string;
    Manager: string;
    IsSupervisor: boolean;
    IsManager: boolean;
    IsPDRRequired: boolean;
    IsLFLicRequired: boolean;
    IsWorksiteRequired: boolean;
    Status: boolean;
    WorkUnitId: string;
    CreatedAt?: string;
}

export interface WorkUnit {
    Id: string;
    WorkUnitName: string;
    Description: string;
    DepartmentId: string;
    Department: string;
}

export interface Department {
    Id: string;
    DepartmentName: string;
    Description: string;
    OrganizationId?: string;
    Organization?: string;
}

export interface Organization {
    Id: string;
    OrganizationName: string;
    Description: string;
}

export interface User {
    Id: string;
    UserFirstName: string;
    UserLastName: string;
    UserEmail: string;
    UserLogin: string;
    UserTitle: string;
}