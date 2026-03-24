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
import { workUnitAPI, departmentAPI } from "../services/api";

interface WorkUnit {
  Id: string;
  Name: string;
  DepartmentId: string;
  DepartmentName?: string;
  EmployeeCount?: number;
}

interface Department {
  Id: string;
  Name: string;
}

function WorkUnitList() {
  const [workUnits, setWorkUnits] = useState<WorkUnit[]>([]);
  const [filteredWorkUnits, setFilteredWorkUnits] = useState<WorkUnit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentWorkUnit, setCurrentWorkUnit] = useState<WorkUnit | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    Name: "",
    DepartmentId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = workUnits.filter(
        (wu) =>
          wu.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          wu.DepartmentName?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredWorkUnits(filtered);
    } else {
      setFilteredWorkUnits(workUnits);
    }
  }, [searchQuery, workUnits]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wuRes, deptRes] = await Promise.all([
        workUnitAPI.getAll(),
        departmentAPI.getAll(),
      ]);

      setWorkUnits(wuRes.data || []);
      setFilteredWorkUnits(wuRes.data || []);
      setDepartments(deptRes.data || []);
      setError("");
    } catch (err) {
      setError("Error fetching work units. Make sure the backend is running.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.Name || !formData.DepartmentId) {
      alert("Name and Department are required");
      return;
    }

    try {
      await workUnitAPI.create(formData);
      await fetchData();
      setIsAddModalOpen(false);
      setFormData({ Name: "", DepartmentId: "" });
    } catch (err: any) {
      console.error("Error creating work unit:", err);
      alert(err.response?.data?.error || "Failed to create work unit");
    }
  };

  const handleEdit = async () => {
    if (!currentWorkUnit || !formData.Name) return;

    try {
      await workUnitAPI.update(currentWorkUnit.Id, formData);
      await fetchData();
      setIsEditModalOpen(false);
      setCurrentWorkUnit(null);
      setFormData({ Name: "", DepartmentId: "" });
    } catch (err: any) {
      console.error("Error updating work unit:", err);
      alert(err.response?.data?.error || "Failed to update work unit");
    }
  };

  const handleDelete = async () => {
    if (!currentWorkUnit) return;
    try {
      await workUnitAPI.delete(currentWorkUnit.Id);
      await fetchData();
      setIsDeleteModalOpen(false);
      setCurrentWorkUnit(null);
    } catch (err: any) {
      console.error("Error deleting work unit:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete work unit";
      alert(errorMessage);
    }
  };

  const openEditModal = (workUnit: WorkUnit) => {
    setCurrentWorkUnit(workUnit);
    setFormData({
      Name: workUnit.Name,
      DepartmentId: workUnit.DepartmentId,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (workUnit: WorkUnit) => {
    setCurrentWorkUnit(workUnit);
    setIsDeleteModalOpen(true);
  };

  const getDepartmentName = (deptId: string) => {
    return departments.find((d) => d.Id === deptId)?.Name || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading work units...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Work Units</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage organizational work units and divisions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Work Unit
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
            placeholder="Search work units..."
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
                      Work Unit Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Department
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Employees
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredWorkUnits.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium">
                            No work units found
                          </p>
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="mt-4 btn-primary"
                          >
                            Add First Work Unit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredWorkUnits.map((wu) => (
                      <tr key={wu.Id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {wu.Name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {wu.DepartmentName ||
                            getDepartmentName(wu.DepartmentId)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {wu.EmployeeCount || 0}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => openEditModal(wu)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            <PencilIcon className="h-5 w-5 inline" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(wu)}
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                      {isAddModalOpen ? "Add New Work Unit" : "Edit Work Unit"}
                    </Dialog.Title>
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Work Unit Name
                        </label>
                        <input
                          type="text"
                          value={formData.Name}
                          onChange={(e) =>
                            setFormData({ ...formData, Name: e.target.value })
                          }
                          className="mt-1 input-field"
                          placeholder="Software Development"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <select
                          value={formData.DepartmentId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              DepartmentId: e.target.value,
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
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={isAddModalOpen ? handleAdd : handleEdit}
                      className="flex-1 btn-success"
                    >
                      {isAddModalOpen ? "Create Work Unit" : "Save Changes"}
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
                        Delete Work Unit
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete{" "}
                          <strong>{currentWorkUnit?.Name}</strong>? This action
                          cannot be undone and will fail if the work unit has
                          employees.
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

export default WorkUnitList;
