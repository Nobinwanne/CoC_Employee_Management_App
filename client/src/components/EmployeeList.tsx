import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Employee, WorkUnit } from '../types';
import { getEmployees, updateEmployee, deleteEmployee, createEmployee, getWorkUnits } from '../services/api';

function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [workunits, setWorkUnits] = useState<WorkUnit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<Omit<Employee, 'Id'>>({
    FirstName: '',
    LastName: '',
    EmployeeId: 0,
    Email: '',
    EmployeeLogin: '',
    Title: '',
    Step: 0,
    Level: 0,
    ReportingLevel: 0,
    DateEmployed: '',
    Supervisor: '',
    SupervisorId: '',
    ManagerId: '',
    Manager: '',
    IsSupervisor: true,
    IsManager: true,
    IsPDRRequired: true,
    IsLFLicRequired: true,
        IsWorksiteRequired: true,
    Status: true,
    WorkUnitId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter employees based on search query
    if (searchQuery) {
      const filtered = employees.filter(employee => 
        employee.FirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.LastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.Email?.toLowerCase().includes(searchQuery.toLowerCase())
        
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchQuery, employees]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, workunitsRes] = await Promise.all([getEmployees(), getWorkUnits()]);
      setEmployees(employeesRes.data);
      setFilteredEmployees(employeesRes.data);
      setWorkUnits(workunitsRes.data);
      setError('');
    } catch (err) {
      setError('Error fetching data. Make sure the backend is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await createEmployee(formData);
      await fetchData();
      setIsAddModalOpen(false);
      setFormData({ 
        FirstName: '',
    LastName: '',
    EmployeeId: 0,
    Email: '',
    EmployeeLogin: '',
    Title: '',
    Step: 0,
    Level: 0,
    ReportingLevel: 0,
    DateEmployed: '',
    Supervisor: '',
    SupervisorId: '',
    ManagerId: '',
    Manager: '',
    IsSupervisor: true,
    IsManager: true,
    IsPDRRequired: true,
    IsLFLicRequired: true,
        IsWorksiteRequired: true,
    Status: true,
    WorkUnitId: '' 
      });
    } catch (err) {
      console.error('Error creating employee:', err);
      alert('Failed to create employee');
    }
  };

  const handleEdit = async () => {
    if (!currentEmployee) return;
    try {
      await updateEmployee(currentEmployee.Id, formData);
      await fetchData();
      setIsEditModalOpen(false);
      setCurrentEmployee(null);
      setFormData({ 
        FirstName: '',
    LastName: '',
    EmployeeId: 0,
    Email: '',
    EmployeeLogin: '',
    Title: '',
    Step: 0,
    Level: 0,
    ReportingLevel: 0,
    DateEmployed: '',
    Supervisor: '',
    SupervisorId: '',
    ManagerId: '',
    Manager: '',
    IsSupervisor: true,
    IsManager: true,
    IsPDRRequired: true,
    IsLFLicRequired: true,
        IsWorksiteRequired: true,
    Status: true,
    WorkUnitId: ''
       });
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('Failed to update employee');
    }
  };

  const handleDelete = async () => {
    if (!currentEmployee) return;
    try {
      await deleteEmployee(currentEmployee.Id);
      await fetchData();
      setIsDeleteModalOpen(false);
      setCurrentEmployee(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee');
    }
  };

  const openEditModal = (employee: Employee) => {
    setCurrentEmployee(employee);
    setFormData({
      EmployeeId: employee.EmployeeId,
      FirstName: employee.FirstName,
      LastName: employee.LastName,
      Email: employee.Email,
      EmployeeLogin: employee.EmployeeLogin,
    Title: employee.Title,
    Step: employee.Step,
    Level: employee.Level,
    ReportingLevel: employee.ReportingLevel,
    DateEmployed: employee.DateEmployed,
    Supervisor: employee.Supervisor,
    SupervisorId: employee.SupervisorId,
    ManagerId: employee.ManagerId,
    Manager: employee.Manager,
    IsSupervisor: employee.IsSupervisor,
    IsManager: employee.IsManager,
    IsPDRRequired: employee.IsPDRRequired,
    IsLFLicRequired: employee.IsLFLicRequired,
        IsWorksiteRequired: employee.IsWorksiteRequired,
    Status: employee.Status,
    WorkUnitId: employee.WorkUnitId
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const getWorkUnitName = (wuId: string) => {
    return workunits.find(wu => wu.Id === wuId)?.WorkUnitName || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Connection Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button onClick={fetchData} className="mt-6 btn-primary">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage employee records and assignments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Department
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium">No employees found</p>
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="mt-4 btn-primary"
                          >
                            Add First Employee
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.Id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {employee.FirstName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {employee.Email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {getWorkUnitName(employee.WorkUnitId)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => openEditModal(employee)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            <PencilIcon className="h-5 w-5 inline" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(employee)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Transition.Root show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsAddModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      Add New Employee
                    </Dialog.Title>
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          value={formData.FirstName}
                          onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                          className="mt-1 input-field"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={formData.Email}
                          onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                          className="mt-1 input-field"
                          placeholder="john.doe@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <select
                          value={formData.WorkUnitId}
                          onChange={(e) => setFormData({ ...formData, WorkUnitId: e.target.value })}
                          className="mt-1 select-field"
                        >
                          <option value="">Select Department</option>
                          {workunits.map((wu) => (
                            <option key={wu.Id} value={wu.Id}>
                              {wu.WorkUnitName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={handleAdd} className="flex-1 btn-success">
                      Create Employee
                    </button>
                    <button onClick={() => setIsAddModalOpen(false)} className="flex-1 btn-secondary">
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Edit Modal - Similar structure to Add Modal */}
      <Transition.Root show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsEditModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      Edit Employee
                    </Dialog.Title>
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          value={formData.FirstName}
                          onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                          className="mt-1 input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={formData.Email}
                          onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                          className="mt-1 input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <select
                          value={formData.WorkUnitId}
                          onChange={(e) => setFormData({ ...formData, WorkUnitId: e.target.value })}
                          className="mt-1 select-field"
                        >
                          {workunits.map((wu) => (
                            <option key={wu.Id} value={wu.Id}>
                              {wu.WorkUnitName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={handleEdit} className="flex-1 btn-success">
                      Save Changes
                    </button>
                    <button onClick={() => setIsEditModalOpen(false)} className="flex-1 btn-secondary">
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Delete Confirmation Modal */}
      <Transition.Root show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsDeleteModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        Delete Employee
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete <strong>{currentEmployee?.FirstName}</strong>? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button onClick={handleDelete} className="btn-danger">
                      Delete
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

export default EmployeeList;