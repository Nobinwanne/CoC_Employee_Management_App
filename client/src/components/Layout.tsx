import { Outlet, NavLink } from "react-router-dom";
import {
  UsersIcon,
  BuildingOfficeIcon,
  CubeIcon,
  ChartBarSquareIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                Employee Management System
              </h1>
              {/* <p className="ml-4 text-sm text-gray-300 hidden sm:block">
                Employee, Work Unit & Department Administration
              </p> */}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-4 pb-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              <UsersIcon className="h-5 w-5 mr-2" />
              Employees
            </NavLink>

            <NavLink
              to="/workunits"
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-4 pb-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              <CubeIcon className="h-5 w-5 mr-2" />
              Work Units
            </NavLink>

            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-4 pb-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Departments
            </NavLink>

            <NavLink
              to="/orgchart"
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-4 pb-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              <ChartBarSquareIcon className="h-5 w-5 mr-2" />
              Org Chart
            </NavLink>

            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-4 pb-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              <DocumentChartBarIcon className="h-5 w-5 mr-2" />
              Reports
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Employee Management System © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
