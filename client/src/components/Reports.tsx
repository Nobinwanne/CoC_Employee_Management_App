import { useState, useEffect } from "react";
import {
  DocumentArrowDownIcon,
  FunnelIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { employeeAPI, departmentAPI, workUnitAPI } from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface Employee {
  ID: string;
  EmployeeID: string;
  Name: string;
  Email: string;
  Title: string;
  EmployeeType: string;
  DepartmentID: string;
  DepartmentName: string;
  WorkUnitID?: string;
  WorkUnitName?: string;
  Status: string;
  FTE: number;
  DateEmployed: string;
  TerminationDate?: string;
  WorkType: string;
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

interface ReportFilters {
  status: string;
  department: string;
  workUnit: string;
  employeeType: string;
  fteMin: string;
  fteMax: string;
  employedStartDate: string;
  employedEndDate: string;
  terminatedStartDate: string;
  terminatedEndDate: string;
  workType: string;
}

interface ReportStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
  totalFTE: number;
  averageFTE: number;
  fullTimeCount: number;
  partTimeCount: number;
  byDepartment: { name: string; count: number; fte: number }[];
  byEmployeeType: { type: string; count: number }[];
}

function Reports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workUnits, setWorkUnits] = useState<WorkUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [stats, setStats] = useState<ReportStats | null>(null);

  const [filters, setFilters] = useState<ReportFilters>({
    status: "all",
    department: "all",
    workUnit: "all",
    employeeType: "all",
    fteMin: "",
    fteMax: "",
    employedStartDate: "",
    employedEndDate: "",
    terminatedStartDate: "",
    terminatedEndDate: "",
    workType: "all",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, deptRes, wuRes] = await Promise.all([
        employeeAPI.getAll(),
        departmentAPI.getAll(),
        workUnitAPI.getAll(),
      ]);

      setEmployees(employeesRes.data || []);
      setDepartments(deptRes.data || []);
      setWorkUnits(wuRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((emp) => emp.Status === filters.status);
    }

    // Department filter
    if (filters.department !== "all") {
      filtered = filtered.filter(
        (emp) => String(emp.DepartmentID) === filters.department,
      );
    }

    // Work Unit filter
    if (filters.workUnit !== "all") {
      filtered = filtered.filter(
        (emp) => String(emp.WorkUnitID) === filters.workUnit,
      );
    }

    // Employee Type filter
    if (filters.employeeType !== "all") {
      filtered = filtered.filter(
        (emp) => emp.EmployeeType === filters.employeeType,
      );
    }

    // FTE range filter
    if (filters.fteMin) {
      const min = parseFloat(filters.fteMin);
      filtered = filtered.filter((emp) => emp.FTE >= min);
    }
    if (filters.fteMax) {
      const max = parseFloat(filters.fteMax);
      filtered = filtered.filter((emp) => emp.FTE <= max);
    }

    // Employment date range filter
    if (filters.employedStartDate) {
      filtered = filtered.filter(
        (emp) => emp.DateEmployed >= filters.employedStartDate,
      );
    }
    if (filters.employedEndDate) {
      filtered = filtered.filter(
        (emp) => emp.DateEmployed <= filters.employedEndDate,
      );
    }

    // Termination date range filter
    if (filters.terminatedStartDate || filters.terminatedEndDate) {
      filtered = filtered.filter((emp) => {
        if (!emp.TerminationDate) return false;
        if (
          filters.terminatedStartDate &&
          emp.TerminationDate < filters.terminatedStartDate
        )
          return false;
        if (
          filters.terminatedEndDate &&
          emp.TerminationDate > filters.terminatedEndDate
        )
          return false;
        return true;
      });
    }

    // Work Type filter
    if (filters.workType !== "all") {
      filtered = filtered.filter((emp) => emp.WorkType === filters.workType);
    }

    setFilteredEmployees(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data: Employee[]) => {
    const stats: ReportStats = {
      totalEmployees: data.length,
      activeEmployees: data.filter((e) => e.Status === "Active").length,
      inactiveEmployees: data.filter((e) => e.Status === "Inactive").length,
      onLeaveEmployees: data.filter((e) => e.Status === "On Leave").length,
      totalFTE: data.reduce((sum, e) => sum + e.FTE, 0),
      averageFTE:
        data.length > 0
          ? data.reduce((sum, e) => sum + e.FTE, 0) / data.length
          : 0,
      fullTimeCount: data.filter((e) => e.FTE >= 1.0).length,
      partTimeCount: data.filter((e) => e.FTE < 1.0 && e.FTE > 0).length,
      byDepartment: [],
      byEmployeeType: [],
    };

    // Group by department
    const deptMap = new Map<string, { count: number; fte: number }>();
    data.forEach((emp) => {
      const deptName = emp.DepartmentName || "Unknown";
      const current = deptMap.get(deptName) || { count: 0, fte: 0 };
      deptMap.set(deptName, {
        count: current.count + 1,
        fte: current.fte + emp.FTE,
      });
    });
    stats.byDepartment = Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      fte: data.fte,
    }));

    // Group by employee type
    const typeMap = new Map<string, number>();
    data.forEach((emp) => {
      const type = emp.EmployeeType || "Unknown";
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    stats.byEmployeeType = Array.from(typeMap.entries()).map(
      ([type, count]) => ({
        type,
        count,
      }),
    );

    setStats(stats);
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      department: "all",
      workUnit: "all",
      employeeType: "all",
      fteMin: "",
      fteMax: "",
      employedStartDate: "",
      employedEndDate: "",
      terminatedStartDate: "",
      terminatedEndDate: "",
      workType: "all",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(18);
    doc.text("Employee Report", pageWidth / 2, 15, { align: "center" });

    // Date
    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      22,
      {
        align: "center",
      },
    );

    // Summary Statistics
    doc.setFontSize(14);
    doc.text("Summary Statistics", 14, 35);
    doc.setFontSize(10);
    let yPos = 42;

    if (stats) {
      const summaryData = [
        ["Total Employees", stats.totalEmployees.toString()],
        ["Active Employees", stats.activeEmployees.toString()],
        ["Inactive Employees", stats.inactiveEmployees.toString()],
        ["On Leave Employees", stats.onLeaveEmployees.toString()],
        ["Total FTE", stats.totalFTE.toFixed(2)],
        ["Average FTE", stats.averageFTE.toFixed(2)],
        ["Full-Time Employees", stats.fullTimeCount.toString()],
        ["Part-Time Employees", stats.partTimeCount.toString()],
      ];

      (doc as any).autoTable({
        startY: yPos,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [71, 85, 105] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Employee List
    doc.setFontSize(14);
    doc.text("Employee List", 14, yPos);
    yPos += 7;

    const tableData = filteredEmployees.map((emp) => [
      emp.EmployeeID,
      emp.Name,
      emp.Title,
      emp.DepartmentName || "-",
      emp.EmployeeType,
      emp.FTE.toFixed(2),
      emp.Status,
    ]);

    (doc as any).autoTable({
      startY: yPos,
      head: [["ID", "Name", "Title", "Department", "Type", "FTE", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [71, 85, 105] },
      styles: { fontSize: 8 },
    });

    doc.save(`employee-report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToExcel = () => {
    // Summary sheet
    const summaryData = [
      ["Employee Report"],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      ["Summary Statistics"],
      ["Metric", "Value"],
      ["Total Employees", stats?.totalEmployees || 0],
      ["Active Employees", stats?.activeEmployees || 0],
      ["Inactive Employees", stats?.inactiveEmployees || 0],
      ["On Leave Employees", stats?.onLeaveEmployees || 0],
      ["Total FTE", stats?.totalFTE.toFixed(2) || "0.00"],
      ["Average FTE", stats?.averageFTE.toFixed(2) || "0.00"],
      ["Full-Time Employees", stats?.fullTimeCount || 0],
      ["Part-Time Employees", stats?.partTimeCount || 0],
      [],
      ["By Department"],
      ["Department", "Count", "Total FTE"],
      ...(stats?.byDepartment.map((d) => [d.name, d.count, d.fte.toFixed(2)]) ||
        []),
      [],
      ["By Employee Type"],
      ["Type", "Count"],
      ...(stats?.byEmployeeType.map((t) => [t.type, t.count]) || []),
    ];

    // Employee data sheet
    const employeeData = [
      [
        "Employee ID",
        "Name",
        "Email",
        "Title",
        "Department",
        "Work Unit",
        "Type",
        "Work Type",
        "FTE",
        "Status",
        "Date Employed",
        "Termination Date",
      ],
      ...filteredEmployees.map((emp) => [
        emp.EmployeeID,
        emp.Name,
        emp.Email,
        emp.Title,
        emp.DepartmentName || "-",
        emp.WorkUnitName || "-",
        emp.EmployeeType,
        emp.WorkType,
        emp.FTE,
        emp.Status,
        emp.DateEmployed,
        emp.TerminationDate || "-",
      ]),
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const wsEmployees = XLSX.utils.aoa_to_sheet(employeeData);

    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsEmployees, "Employees");

    XLSX.writeFile(
      wb,
      `employee-report-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Generate comprehensive reports with custom filters and export
            options
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-green-600" />
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-red-600" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <FunnelIcon className="h-5 w-5" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Report Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="input-field w-full"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    department: e.target.value,
                    workUnit: "all",
                  });
                }}
                className="input-field w-full"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.Id} value={dept.Id}>
                    {dept.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Unit
              </label>
              <select
                value={filters.workUnit}
                onChange={(e) =>
                  setFilters({ ...filters, workUnit: e.target.value })
                }
                className="input-field w-full"
                disabled={filters.department === "all"}
              >
                <option value="all">All Work Units</option>
                {workUnits
                  .filter((wu) =>
                    filters.department === "all"
                      ? true
                      : String(wu.DepartmentId) === filters.department,
                  )
                  .map((wu) => (
                    <option key={wu.Id} value={wu.Id}>
                      {wu.Name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Employee Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Type
              </label>
              <select
                value={filters.employeeType}
                onChange={(e) =>
                  setFilters({ ...filters, employeeType: e.target.value })
                }
                className="input-field w-full"
              >
                <option value="all">All Types</option>
                <option value="City Manager">City Manager</option>
                <option value="Council Member">Council Member</option>
                <option value="Senior Manager">Senior Manager</option>
                <option value="Manager">Manager</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Worker">Worker</option>
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Type
              </label>
              <select
                value={filters.workType}
                onChange={(e) =>
                  setFilters({ ...filters, workType: e.target.value })
                }
                className="input-field w-full"
              >
                <option value="all">All Work Types</option>
                <option value="Permanent - Full Time">
                  Permanent - Full Time
                </option>
                <option value="Permanent - Part Time">
                  Permanent - Part Time
                </option>
                <option value="Temporary - Contractor">
                  Temporary - Contractor
                </option>
                <option value="Temporary - Casual">Temporary - Casual</option>
              </select>
            </div>

            {/* FTE Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min FTE
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={filters.fteMin}
                onChange={(e) =>
                  setFilters({ ...filters, fteMin: e.target.value })
                }
                className="input-field w-full"
                placeholder="0.00"
              />
            </div>

            {/* FTE Max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max FTE
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={filters.fteMax}
                onChange={(e) =>
                  setFilters({ ...filters, fteMax: e.target.value })
                }
                className="input-field w-full"
                placeholder="1.00"
              />
            </div>

            {/* Spacer */}
            <div></div>

            {/* Employment Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employed After
              </label>
              <input
                type="date"
                value={filters.employedStartDate}
                onChange={(e) =>
                  setFilters({ ...filters, employedStartDate: e.target.value })
                }
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employed Before
              </label>
              <input
                type="date"
                value={filters.employedEndDate}
                onChange={(e) =>
                  setFilters({ ...filters, employedEndDate: e.target.value })
                }
                className="input-field w-full"
              />
            </div>

            {/* Termination Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terminated After
              </label>
              <input
                type="date"
                value={filters.terminatedStartDate}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    terminatedStartDate: e.target.value,
                  })
                }
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terminated Before
              </label>
              <input
                type="date"
                value={filters.terminatedEndDate}
                onChange={(e) =>
                  setFilters({ ...filters, terminatedEndDate: e.target.value })
                }
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-12 w-12 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Employees
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalEmployees}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-12 w-12 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Active Employees
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activeEmployees}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-12 w-12 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total FTE</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalFTE.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-12 w-12 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg FTE</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.averageFTE.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* By Department */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              By Department
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total FTE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.byDepartment.map((dept, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {dept.count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {dept.fte.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Employee Type */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              By Employee Type
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.byEmployeeType.map((type, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {type.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {type.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Employee List ({filteredEmployees.length} employees)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  FTE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.ID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {employee.EmployeeID}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {employee.Name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.Title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.DepartmentName || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.EmployeeType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.FTE.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        employee.Status === "Active"
                          ? "bg-green-100 text-green-800"
                          : employee.Status === "Inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {employee.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
