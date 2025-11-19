import { useState } from 'react';
import './App.css';
import EmployeeList from './components/EmployeeList';
import DepartmentList from './components/DepartmentList';
import Header from './components/Header';
import WorkUnitList from './components/WorkUnitList';

function App() {
  const [activeTab, setActiveTab] = useState<'employees' | 'workunits' | 'departments' | 'organizations'>('employees');

  return (
    <div className="App">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="main-content">
        {activeTab === 'employees' && <EmployeeList />}
           {activeTab === 'workunits' && <WorkUnitList />}
        {activeTab === 'departments' && <DepartmentList />}
           {/* {activeTab === 'workunits' && <OrganizationList />} */}
      </main>
    </div>
  );
}

export default App;