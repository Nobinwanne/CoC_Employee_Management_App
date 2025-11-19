import '../styles/Header.css';
//import cityLogo from '../assets/City-Logo-.jpg'

interface HeaderProps {
  activeTab: 'employees' | 'workunits' | 'departments' | 'organizations';
  onTabChange: (tab: 'employees' | 'workunits' | 'departments' | 'organizations') => void;
}

function Header({ activeTab, onTabChange }: HeaderProps) {

  return (
    <header className="header">
       {/* <img src={cityLogo} width="100" height="100" /> */}
      <div className="header-container">
        <div className="header-brand">
          <h1>Employee Management System</h1>
          <p className="header-subtitle">Employee, Work Unit & Department Administration</p>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-button ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => onTabChange('employees')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Employees</span>
          </button>
           <button
            className={`nav-button ${activeTab === 'workunits' ? 'active' : ''}`}
            onClick={() => onTabChange('workunits')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Work Units</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => onTabChange('departments')}
          >
            <span className="nav-icon">🏢</span>
            <span className="nav-text">Departments</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;