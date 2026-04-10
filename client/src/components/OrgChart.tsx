import { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  UserIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

interface Employee {
  ID: string;
  EmployeeID: string;
  Name: string;
  Email: string;
  Title: string;
  EmployeeType: string;
  DepartmentID: number;
  DepartmentName: string;
  WorkUnitID?: number;
  WorkUnitName?: string;
  ManagerID?: string;
  SupervisorID?: string;
  Status: string;
  FTE: number;
}

interface Department {
  Id: number;
  Name: string;
  Description?: string;
}

interface WorkUnit {
  Id: number;
  Name: string;
  DepartmentId: number;
  Description?: string;
}

interface OrgChartData {
  employees: Employee[];
  departments: Department[];
  workUnits: WorkUnit[];
}

function OrgChart() {
  const [data, setData] = useState<OrgChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    fetchOrgChart();
  }, []);

  const fetchOrgChart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employees/org/chart`);
      setData(response.data.data);
      setError("");
    } catch (err: any) {
      setError("Failed to load organization chart");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (deptId: number) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const toggleWorkUnit = (unitId: number) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const toggleEmployee = (empId: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(empId)) {
      newExpanded.delete(empId);
    } else {
      newExpanded.add(empId);
    }
    setExpandedEmployees(newExpanded);
  };

  const getEmployeesByDepartment = (deptId: number) => {
    if (!data) return [];
    return data.employees.filter(
      (emp) => emp.DepartmentID === deptId && !emp.WorkUnitID,
    );
  };

  const getEmployeesByWorkUnit = (unitId: number) => {
    if (!data) return [];
    return data.employees.filter((emp) => emp.WorkUnitID === unitId);
  };

  const getWorkUnitsByDepartment = (deptId: number) => {
    if (!data) return [];
    return data.workUnits.filter((wu) => wu.DepartmentId === deptId);
  };

  const getDirectReports = (managerId: string) => {
    if (!data) return [];
    return data.employees.filter(
      (emp) => emp.ManagerID === managerId || emp.SupervisorID === managerId,
    );
  };

  const getEmployeeTypeColor = (type: string) => {
    switch (type) {
      case "City Manager":
        return "bg-blue-900 text-white";
      case "Council Member":
        return "bg-cyan-600 text-white";
      case "Senior Manager":
        return "bg-green-600 text-white";
      case "Manager":
        return "bg-green-500 text-white";
      case "Supervisor":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTopLevelEmployees = () => {
    if (!data) return [];
    // Get City Manager only for executive leadership
    return data.employees.filter((emp) => emp.EmployeeType === "City Manager");
  };

  const getSeniorManagers = () => {
    if (!data) return [];
    // Get Senior Managers who report to City Manager
    return data.employees.filter(
      (emp) => emp.EmployeeType === "Senior Manager",
    );
  };

  const getCouncilMembers = () => {
    if (!data) return [];
    // Get all Council Members (elected officials)
    return data.employees.filter(
      (emp) => emp.EmployeeType === "Council Member",
    );
  };

  const renderEmployee = (employee: Employee, level: number = 0) => {
    const directReports = getDirectReports(employee.ID);
    const hasReports = directReports.length > 0;
    const isExpanded = expandedEmployees.has(employee.ID);

    return (
      <div
        key={employee.ID}
        className="mb-2"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div
          className={`flex items-center p-3 rounded-lg border-2 border-gray-300 bg-white hover:shadow-md transition-shadow cursor-pointer`}
          onClick={() => hasReports && toggleEmployee(employee.ID)}
        >
          {hasReports && (
            <button className="mr-2">
              {isExpanded ? (
                <ChevronDownIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          )}
          {!hasReports && <div className="w-7" />}

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {employee.Name}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getEmployeeTypeColor(employee.EmployeeType)}`}
                  >
                    {employee.EmployeeType}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {employee.Title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  FTE: {employee.FTE} | {employee.Email}
                </div>
              </div>
              {hasReports && (
                <span className="text-sm text-gray-500">
                  {directReports.length} direct report
                  {directReports.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {isExpanded && hasReports && (
          <div className="mt-2 ml-6 border-l-2 border-gray-200 pl-4">
            {directReports.map((emp) => renderEmployee(emp, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderWorkUnit = (unit: WorkUnit) => {
    const employees = getEmployeesByWorkUnit(unit.Id);
    const isExpanded = expandedUnits.has(unit.Id);

    return (
      <div key={unit.Id} className="mb-3 ml-6">
        <div
          className="flex items-center p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer"
          onClick={() => toggleWorkUnit(unit.Id)}
        >
          <button className="mr-2">
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5 text-blue-600" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-blue-600" />
            )}
          </button>
          <UserGroupIcon className="h-5 w-5 text-blue-600 mr-2" />
          <span className="font-semibold text-blue-900">{unit.Name}</span>
          <span className="ml-auto text-sm text-blue-700">
            {employees.length} employee{employees.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isExpanded && (
          <div className="mt-2 ml-4">
            {employees.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 italic flex items-center gap-2">
                <ExclamationCircleIcon className="h-5 w-5" />
                No employees in this work unit
              </div>
            ) : (
              employees.map((emp) => renderEmployee(emp))
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDepartment = (dept: Department) => {
    const workUnits = getWorkUnitsByDepartment(dept.Id);
    const deptEmployees = getEmployeesByDepartment(dept.Id);
    const isExpanded = expandedDepts.has(dept.Id);

    return (
      <div
        key={dept.Id}
        className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div
          className="flex items-center p-4 rounded-t-lg bg-gradient-to-r from-primary-50 to-primary-100 cursor-pointer hover:from-primary-100 hover:to-primary-200"
          onClick={() => toggleDepartment(dept.Id)}
        >
          <button className="mr-3">
            {isExpanded ? (
              <ChevronDownIcon className="h-6 w-6 text-primary-700" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-primary-700" />
            )}
          </button>
          <BuildingOfficeIcon className="h-6 w-6 text-primary-700 mr-3" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary-900">{dept.Name}</h3>
            {dept.Description && (
              <p className="text-sm text-primary-700 mt-1">
                {dept.Description}
              </p>
            )}
          </div>
          <div className="text-sm text-primary-700">
            {workUnits.length} work unit{workUnits.length !== 1 ? "s" : ""} |{" "}
            {deptEmployees.length +
              workUnits.reduce(
                (sum, wu) => sum + getEmployeesByWorkUnit(wu.Id).length,
                0,
              )}{" "}
            employees
          </div>
        </div>

        {isExpanded && (
          <div className="p-4">
            {/* Department-level employees (not in work units) */}
            {deptEmployees.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Department Leadership
                </h4>
                {deptEmployees.map((emp) => renderEmployee(emp))}
              </div>
            )}

            {/* Work Units */}
            {workUnits.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Work Units
                </h4>
                {workUnits.map(renderWorkUnit)}
              </div>
            )}

            {workUnits.length === 0 && deptEmployees.length === 0 && (
              <div className="p-4 text-center text-gray-500 italic flex items-center justify-center gap-2">
                <ExclamationCircleIcon className="h-5 w-5" />
                No employees or work units in this department
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Loading organization chart...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <ExclamationCircleIcon className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button onClick={fetchOrgChart} className="mt-6 btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const topLevelEmployees = getTopLevelEmployees();
  const seniorManagers = getSeniorManagers();
  const councilMembers = getCouncilMembers();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Organization Chart</h1>
        <p className="mt-2 text-sm text-gray-700">
          View the organizational structure, departments, and reporting
          hierarchy (active employees only)
        </p>
      </div>

      {/* Elected Officials - Council Members */}
      {councilMembers.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg p-4 border-2 border-cyan-300">
            <h2 className="text-xl font-bold text-cyan-900 mb-4 flex items-center gap-2">
              <UserGroupIcon className="h-6 w-6" />
              Elected Officials - City Council
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {councilMembers.map((emp) => (
                <div key={emp.ID}>{renderEmployee(emp)}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Executive Leadership - City Manager & Senior Managers */}
      {topLevelEmployees.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="h-6 w-6" />
              Executive Leadership
            </h2>

            {/* City Manager */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">
                City Manager
              </h3>
              {topLevelEmployees.map((emp) => (
                <div key={emp.ID}>{renderEmployee(emp)}</div>
              ))}
            </div>

            {/* Senior Managers */}
            {seniorManagers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-blue-800 mb-3">
                  Senior Managers (General Managers)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seniorManagers.map((emp) => (
                    <div key={emp.ID}>{renderEmployee(emp)}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Departments */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Departments</h2>
        {data?.departments.map(renderDepartment)}
      </div>
    </div>
  );
}

export default OrgChart;
