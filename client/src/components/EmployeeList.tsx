import { useState, useEffect } from 'react';
import { Employee, WorkUnit } from '../types';
import { createEmployee, getEmployees, getWorkUnits, updateEmployee, deleteEmployee } from '../services/api';
import '../styles/DataTable.css'

function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workUnits, setWorkUnits] = useState<WorkUnit[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ 
   Id: 0,
    FirstName: '',
    LastName: '',
    EmployeeId: 0,
    Email: '',
    EmployeeLogin: '',
    Title: '',
    Step: 0,
    Level: 0,
    ReportingLevel: 0,
    DateEmployed: '',
    SupervisorId: 0,
    Supervisor: '',
    Manager: '',
    ManagerId: 0,
    IsSupervisor: true,
    IsManager: true,
    IsPDRRequired: true,
    IsLFLicRequired: true,
    IsWorksiteRequired: true,
    Status: true,
    WorkUnitId: 0,
    CreatedAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, wuRes] = await Promise.all([getEmployees(), getWorkUnits()]);
      setEmployees(employeesRes.data);
      setWorkUnits(wuRes.data);
      setError('');
    } catch (err) {
      setError('Error fetching data. Make sure the backend is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.Id);
    setEditForm({ 
      FirstName: employee.FirstName, 
      Email: employee.Email, 
      WorkUnitId: employee.WorkUnitId });
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateEmployee(id, editForm as Omit<Employee, 'Id' | 'CreatedAt'>);
      await fetchData();
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('Failed to update employee');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await deleteEmployee(id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee');
    }
  };

  const handleAdd = async () => {
    try {
      await createEmployee(newEmployee);
      await fetchData();
      setShowAddForm(false);
      setNewEmployee({
       Id: 0,
    FirstName: '',
    LastName: '',
    EmployeeId: 0,
    Email: '',
    EmployeeLogin: '',
    Title: '',
    Step: 0,
    Level: 0,
    ReportingLevel: 0,
    DateEmployed: '',
    SupervisorId: 0,
    Supervisor: '',
    Manager: '',
    ManagerId: 0,
    IsSupervisor: true,
    IsManager: true,
    IsPDRRequired: true,
    IsLFLicRequired: true,
    IsWorksiteRequired: true,
    Status: true,
    WorkUnitId: 0,
    CreatedAt: '',
    });
    } catch (err) {
      console.error('Error creating employee:', err);
      alert('Failed to create employee');
    }
  };

  const getWorkUnitName = (wuId: number) => {
    return workUnits.find(wu => wu.Id === wuId)?.WorkUnitName || 'Unknown';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Employees</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Add New Employee</h3>
          <input
            type="text"
            placeholder="First Name"
            value={newEmployee.FirstName}
            onChange={(e) => setNewEmployee({ ...newEmployee, FirstName: e.target.value })}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newEmployee.LastName}
            onChange={(e) => setNewEmployee({ ...newEmployee, LastName: e.target.value })}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmployee.Email}
            onChange={(e) => setNewEmployee({ ...newEmployee, Email: e.target.value })}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <select
            value={newEmployee.WorkUnitId}
            onChange={(e) => setNewEmployee({ ...newEmployee, WorkUnitId: Number(e.target.value) })}
            style={{ marginRight: '10px', padding: '5px' }}
          >
            <option value={0}>Select WorkUnit</option>
            {workUnits.map(wu => (
              <option key={wu.Id} value={wu.Id}>{wu.WorkUnitName}</option>
            ))}
          </select>
          <button onClick={handleAdd}>Save</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>First Name</th>
             <th style={{ padding: '10px', textAlign: 'left' }}>Last Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>WorkUnit</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.Id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>
                {editingId === employee.Id ? (
                  <input
                    type="text"
                    value={editForm.FirstName || ''}
                    onChange={(e) => setEditForm({ ...editForm, FirstName: e.target.value })}
                  />
                ) : (
                  employee.FirstName
                )}
              </td>
               <td style={{ padding: '10px' }}>
                {editingId === employee.Id ? (
                  <input
                    type="text"
                    value={editForm.LastName || ''}
                    onChange={(e) => setEditForm({ ...editForm, LastName: e.target.value })}
                  />
                ) : (
                  employee.FirstName
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === employee.Id ? (
                  <input
                    type="email"
                    value={editForm.Email || ''}
                    onChange={(e) => setEditForm({ ...editForm, Email: e.target.value })}
                  />
                ) : (
                  employee.Email
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === employee.Id ? (
                  <select
                    value={editForm.WorkUnitId || 0}
                    onChange={(e) => setEditForm({ ...editForm, WorkUnitId: Number(e.target.value) })}
                  >
                    {workUnits.map(wu => (
                      <option key={wu.Id} value={wu.Id}>{wu.WorkUnitName}</option>
                    ))}
                  </select>
                ) : (
                  getWorkUnitName(employee.WorkUnitId)
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === employee.Id ? (
                  <>
                    <button onClick={() => handleUpdate(employee.Id)} style={{ marginRight: '5px' }}>
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(employee)} style={{ marginRight: '5px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(employee.Id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;

