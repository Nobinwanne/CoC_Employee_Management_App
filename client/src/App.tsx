import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeList from "./components/EmployeeList";
import DepartmentList from "./components/DepartmentList";
import WorkUnitList from "./components/WorkUnitList";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/departments" element={<DepartmentList />} />
        <Route path="/workunits" element={<WorkUnitList />} />
      </Routes>
    </BrowserRouter>
  );
}
