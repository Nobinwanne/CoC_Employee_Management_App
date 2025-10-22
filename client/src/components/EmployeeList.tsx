import { useState, useEffect } from 'react';
import { Employee, Department } from '../types';
import { getEmployees, getDepartments, updateEmployee, deleteEmployee, createEmployee } from '../services/api';

function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ id: 0, name: '', email: '', departmentId: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, deptsRes] = await Promise.all([getEmployees(), getDepartments()]);
      setEmployees(employeesRes.data);
      setDepartments(deptsRes.data);
      setError('');
    } catch (err) {
      setError('Error fetching data. Make sure the backend is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setEditForm({ name: employee.name, email: employee.email, departmentId: employee.departmentId });
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
      setNewEmployee({id: 0, name: '', email: '', departmentId: 0 });
    } catch (err) {
      console.error('Error creating employee:', err);
      alert('Failed to create employee');
    }
  };

  const getDepartmentName = (deptId: number) => {
    return departments.find(d => d.id === deptId)?.name || 'Unknown';
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
            placeholder="Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <select
            value={newEmployee.departmentId}
            onChange={(e) => setNewEmployee({ ...newEmployee, departmentId: Number(e.target.value) })}
            style={{ marginRight: '10px', padding: '5px' }}
          >
            <option value={0}>Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <button onClick={handleAdd}>Save</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Department</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>
                {editingId === employee.id ? (
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                ) : (
                  employee.name
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === employee.id ? (
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                ) : (
                  employee.email
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === employee.id ? (
                  <select
                    value={editForm.departmentId || 0}
                    onChange={(e) => setEditForm({ ...editForm, departmentId: Number(e.target.value) })}
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                ) : (
                  getDepartmentName(employee.departmentId)
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === employee.id ? (
                  <>
                    <button onClick={() => handleUpdate(employee.id)} style={{ marginRight: '5px' }}>
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(employee)} style={{ marginRight: '5px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(employee.id)}>Delete</button>
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

