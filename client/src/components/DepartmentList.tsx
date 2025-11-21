import { useState, useEffect } from 'react';
import { Department } from '../types';
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from '../services/api';

function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Department>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDept, setNewDept] = useState({ Id: '', DepartmentName: '', Description: '', Organization: '', OrganizationId: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.Id);
    setEditForm({ DepartmentName: dept.DepartmentName, Description: dept.Description, Organization: dept.Organization });
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDepartment(id, editForm as Omit<Department, 'Id'>);
      await fetchDepartments();
      setEditingId(null);
    } catch (err) {
      console.error('Error updating department:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this department?')) return;
    try {
      await deleteDepartment(id);
      await fetchDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
    }
  };

  const handleAdd = async () => {
    try {
      await createDepartment(newDept);
      await fetchDepartments();
      setShowAddForm(false);
      setNewDept({ Id: '', DepartmentName: '', Description: '', Organization: '', OrganizationId: '' });
    } catch (err) {
      console.error('Error creating department:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Departments</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add Department'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <input
            type="text"
            placeholder="Name"
            value={newDept.DepartmentName}
            onChange={(e) => setNewDept({ ...newDept, DepartmentName: e.target.value })}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={newDept.Description}
            onChange={(e) => setNewDept({ ...newDept, Description: e.target.value })}
            style={{ marginRight: '10px' }}
          />
          <button onClick={handleAdd}>Save</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(dept => (
            <tr key={dept.Id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>
                {editingId === dept.Id ? (
                  <input
                    value={editForm.DepartmentName || ''}
                    onChange={(e) => setEditForm({ ...editForm, DepartmentName: e.target.value })}
                  />
                ) : (
                  dept.DepartmentName
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === dept.Id ? (
                  <input
                    value={editForm.Description || ''}
                    onChange={(e) => setEditForm({ ...editForm, Description: e.target.value })}
                  />
                ) : (
                  dept.Description
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === dept.Id ? (
                  <>
                    <button onClick={() => handleUpdate(dept.Id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(dept)}>Edit</button>
                    <button onClick={() => handleDelete(dept.Id)}>Delete</button>
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

export default DepartmentList;