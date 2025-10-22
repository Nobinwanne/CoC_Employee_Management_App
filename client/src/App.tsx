import { useState } from 'react';
import './App.css';
import EmployeeList from './components/EmployeeList';
import DepartmentList from './components/DepartmentList';
//import WorkUnitList from './components/WorkUnitList';

function App() {
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'workunits'>('users');

  return (
    <div className="App">
      <header style={{ padding: '20px', borderBottom: '2px solid #ddd' }}>
        <h1>Management System</h1>
        <nav style={{ marginTop: '10px' }}>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ 
              marginRight: '10px', 
              padding: '10px 20px',
              fontWeight: activeTab === 'users' ? 'bold' : 'normal'
            }}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('departments')}
            style={{ 
              marginRight: '10px', 
              padding: '10px 20px',
              fontWeight: activeTab === 'departments' ? 'bold' : 'normal'
            }}
          >
            Departments
          </button>
          <button 
            onClick={() => setActiveTab('workunits')}
            style={{ 
              padding: '10px 20px',
              fontWeight: activeTab === 'workunits' ? 'bold' : 'normal'
            }}
          >
            Work Units
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'users' && <EmployeeList />}
        {activeTab === 'departments' && <DepartmentList />}
        {/* {activeTab === 'workunits' && <WorkUnitList />} */}
      </main>
    </div>
  );
}

export default App;