import axios from 'axios';
import { Employee, Department, WorkUnit } from '../types';

const API_URL = 'http://localhost:5000/api';

//Employees
export const getEmployees = () => axios.get<Employee[]>(`${API_URL}/employees`);
export const createEmployee = (employeeData: Omit<Employee, 'Id' | 'CreatedAt'>) => 
  axios.post(`${API_URL}/Employees`, employeeData);
export const updateEmployee = (id: number, employeeData: Omit<Employee, 'Id' | 'CreatedAt'>) => 
  axios.put(`${API_URL}/Employees/${id}`, employeeData);
export const deleteEmployee = (id: number) => 
  axios.delete(`${API_URL}/Employees/${id}`);

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