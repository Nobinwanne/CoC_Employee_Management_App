import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { employeeAPI, departmentAPI, workUnitAPI } from "../services/api";

interface Employee {
  ID: string;
  EmployeeID: string;
  Name: string;
  Email: string;
  Title: string;
  WorkUnitID: string;
  WorkUnitName?: string;
  DepartmentID: string;
  DepartmentName?: string;
  EmployeeType: string;
  WorkType: string;
  Status: string;
}

interface Department {
  Id: string;
  Name: string;
}

interface WorkUnit {
  Id: string;
  Name: string;
  DepartmentId: string;
}

function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workUnits, setWorkUnits] = useState<WorkUnit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    ID: "",
    EmployeeID: "0",
    Name: "",
    Email: "",
    Title: "",
    DepartmentID: "",
    WorkUnitID: "",
    EmployeeType: "Worker",
    WorkType: "Permanent - Full Time",
    DateEmployed: new Date().toISOString().split("T")[0],
    Status: "Active",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter employees based on search query
    if (searchQuery) {
      const filtered = employees.filter(
        (employee) =>
          employee.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.Title?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchQuery, employees]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, deptRes, wuRes] = await Promise.all([
        employeeAPI.getAll(),
        departmentAPI.getAll(),
        workUnitAPI.getAll(),
      ]);

      setEmployees(employeesRes.data || []);
      setFilteredEmployees(employeesRes.data || []);
      setDepartments(deptRes.data || []);
      setWorkUnits(wuRes.data || []);
      setError("");
    } catch (err: any) {
      setError("Error fetching data. Make sure the backend is running.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      // Validation
      if (
        !formData.ID ||
        !formData.Name ||
        !formData.Email ||
        !formData.DepartmentID
      ) {
        alert("ID, Name, Email, and Department are required");
        return;
      }

      await employeeAPI.create(formData);
      await fetchData();
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Error creating employee:", err);
      alert(err.response?.data?.error || "Failed to create employee");
    }
  };

  const handleEdit = async () => {
    if (!currentEmployee) return;
    try {
      await employeeAPI.update(currentEmployee.ID, formData);
      await fetchData();
      setIsEditModalOpen(false);
      setCurrentEmployee(null);
      resetForm();
    } catch (err: any) {
      console.error("Error updating employee:", err);
      alert(err.response?.data?.error || "Failed to update employee");
    }
  };

  const handleDelete = async () => {
    if (!currentEmployee) return;
    try {
      await employeeAPI.delete(currentEmployee.ID);
      await fetchData();
      setIsDeleteModalOpen(false);
      setCurrentEmployee(null);
    } catch (err: any) {
      console.error("Error deleting employee:", err);
      alert(err.response?.data?.error || "Failed to delete employee");
    }
  };

  const resetForm = () => {
    setFormData({
      ID: "",
      EmployeeID: "0",
      Name: "",
      Email: "",
      Title: "",
      DepartmentID: "",
      WorkUnitID: "",
      EmployeeType: "Worker",
      WorkType: "Permanent - Full Time",
      DateEmployed: new Date().toISOString().split("T")[0],
      Status: "Active",
    });
  };

  const openEditModal = (employee: Employee) => {
    setCurrentEmployee(employee);
    setFormData({
      ID: employee.ID,
      EmployeeID: employee.EmployeeID || "0",
      Name: employee.Name,
      Email: employee.Email,
      Title: employee.Title || "",
      DepartmentID: employee.DepartmentID || "",
      WorkUnitID: employee.WorkUnitID || "",
      EmployeeType: employee.EmployeeType || "Worker",
      WorkType: employee.WorkType || "Permanent - Full Time",
      DateEmployed: new Date().toISOString().split("T")[0],
      Status: employee.Status || "Active",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const getWorkUnitsByDepartment = (deptId: string) => {
    return workUnits.filter((wu) => wu.DepartmentId === deptId);
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
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Connection Error
            </h2>
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
                      Title
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Department
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium">
                            No employees found
                          </p>
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
                      <tr key={employee.ID} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {employee.Name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {employee.Email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {employee.Title || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {employee.DepartmentName || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              employee.Status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {employee.Status}
                          </span>
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

      {/* Add/Edit Modal */}
      <Transition.Root show={isAddModalOpen || isEditModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
        >
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                      }}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900"
                    >
                      {isAddModalOpen ? "Add New Employee" : "Edit Employee"}
                    </Dialog.Title>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {isAddModalOpen && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Employee ID *
                          </label>
                          <input
                            type="text"
                            value={formData.ID}
                            onChange={(e) =>
                              setFormData({ ...formData, ID: e.target.value })
                            }
                            className="mt-1 input-field"
                            placeholder="EMP001"
                          />
                        </div>
                      )}
                      <div className={isAddModalOpen ? "" : "col-span-2"}>
                        <label className="block text-sm font-medium text-gray-700">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={formData.Name}
                          onChange={(e) =>
                            setFormData({ ...formData, Name: e.target.value })
                          }
                          className="mt-1 input-field"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.Email}
                          onChange={(e) =>
                            setFormData({ ...formData, Email: e.target.value })
                          }
                          className="mt-1 input-field"
                          placeholder="john.doe@camrose.ca"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          type="text"
                          value={formData.Title}
                          onChange={(e) =>
                            setFormData({ ...formData, Title: e.target.value })
                          }
                          className="mt-1 input-field"
                          placeholder="Software Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department *
                        </label>
                        <select
                          value={formData.DepartmentID}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              DepartmentID: e.target.value,
                              WorkUnitID: "",
                            })
                          }
                          className="mt-1 select-field"
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.Id} value={dept.Id}>
                              {dept.Name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Work Unit
                        </label>
                        <select
                          value={formData.WorkUnitID}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              WorkUnitID: e.target.value,
                            })
                          }
                          className="mt-1 select-field"
                          disabled={!formData.DepartmentID}
                        >
                          <option value="">Select Work Unit</option>
                          {getWorkUnitsByDepartment(formData.DepartmentID).map(
                            (wu) => (
                              <option key={wu.Id} value={wu.Id}>
                                {wu.Name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Employee Type
                        </label>
                        <select
                          value={formData.EmployeeType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              EmployeeType: e.target.value,
                            })
                          }
                          className="mt-1 select-field"
                        >
                          <option value="Worker">Worker</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Manager">Manager</option>
                          <option value="Senior Manager">Senior Manager</option>
                          <option value="Council Member">Council Member</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Work Type
                        </label>
                        <select
                          value={formData.WorkType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              WorkType: e.target.value,
                            })
                          }
                          className="mt-1 select-field"
                        >
                          <option value="Permanent - Full Time">
                            Permanent - Full Time
                          </option>
                          <option value="Permanent - Part Time">
                            Permanent - Part Time
                          </option>
                          <option value="Temporary - Contractor">
                            Temporary - Contractor
                          </option>
                          <option value="Temporary - Casual">
                            Temporary - Casual
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={isAddModalOpen ? handleAdd : handleEdit}
                      className="flex-1 btn-success"
                    >
                      {isAddModalOpen ? "Create Employee" : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                      }}
                      className="flex-1 btn-secondary"
                    >
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
        <Dialog
          as="div"
          className="relative z-50"
          onClose={setIsDeleteModalOpen}
        >
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
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900"
                      >
                        Delete Employee
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete{" "}
                          <strong>{currentEmployee?.Name}</strong>? This will
                          set their status to Inactive.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button onClick={handleDelete} className="btn-danger">
                      Delete
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="btn-secondary"
                    >
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
