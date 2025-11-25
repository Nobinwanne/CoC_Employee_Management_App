import { useState } from 'react';
import Header from './components/Header';
import DepartmentList from './components/DepartmentList';
import WorkUnitList from './components/WorkUnitList';
import EmployeeList from './components/EmployeeList';

function App() {
  const [activeTab, setActiveTab] = useState<'employees' | 'departments' | 'workunits'>('employees');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-7xl py-8">
        {activeTab === 'employees' && <EmployeeList />}
        {activeTab === 'departments' && <DepartmentList />}
        {activeTab === 'workunits' && <WorkUnitList />}
      </main>
    </div>
  );
}

export default App;