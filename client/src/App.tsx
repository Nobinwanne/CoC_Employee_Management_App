import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import EmployeeList from "./components/EmployeeList";
import DepartmentList from "./components/DepartmentList";
import WorkUnitList from "./components/WorkUnitList";
import OrgChart from "./components/OrgChart";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/employees" replace />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="workunits" element={<WorkUnitList />} />
          <Route path="orgchart" element={<OrgChart />} />
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
