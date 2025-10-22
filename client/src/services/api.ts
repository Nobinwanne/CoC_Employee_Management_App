import axios from 'axios';
import { Employee, Department, WorkUnit, Organization } from '../types';

const API_URL = 'http://localhost:5000/api';

//Employees
export const getEmployees = () => axios.get<Employee[]>(`${API_URL}/employees`);
export const createEmployee = (employeeData: Omit<Employee, 'Id' | 'CreatedAt'>) => 
  axios.post(`${API_URL}/employees`, employeeData);
export const updateEmployee = (id: number, employeeData: Omit<Employee, 'Id' | 'CreatedAt'>) => 
  axios.put(`${API_URL}/employees/${id}`, employeeData);
export const deleteEmployee = (id: number) => 
  axios.delete(`${API_URL}/employees/${id}`);

// Departments
export const getDepartments = () => axios.get<Department[]>(`${API_URL}/departments`);
export const createDepartment = (deptData: Omit<Department, 'Id'>) => 
  axios.post(`${API_URL}/departments`, deptData);
export const updateDepartment = (id: number, deptData: Omit<Department, 'Id'>) => 
  axios.put(`${API_URL}/departments/${id}`, deptData);
export const deleteDepartment = (id: number) => 
  axios.delete(`${API_URL}/departments/${id}`);

// Work Units
export const getWorkUnits = () => axios.get<WorkUnit[]>(`${API_URL}/workunits`);
export const createWorkUnit = (unitData: Omit<WorkUnit, 'Id'>) => 
  axios.post(`${API_URL}/workunits`, unitData);
export const updateWorkUnit = (id: number, unitData: Omit<WorkUnit, 'Id'>) => 
  axios.put(`${API_URL}/workunits/${id}`, unitData);
export const deleteWorkUnit = (id: number) => 
  axios.delete(`${API_URL}/workunits/${id}`);

//Organization
export const getOrganizations = () => axios.get<Organization[]>(`${API_URL}/organizations`);
export const createOrganization = (organizationData: Omit<Organization, 'id'>) =>
    axios.post(`${API_URL}/organizations`, organizationData);
export const updateOrganization = (id: number, organizationData: Omit<Organization, 'id'>) =>
    axios.put(`${API_URL}/organizations/${id}`, organizationData);
export const deleteOrganization = (id: number) => 
  axios.delete(`${API_URL}/organizations/${id}`);
