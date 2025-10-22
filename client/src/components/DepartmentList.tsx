import { useState, useEffect } from 'react';
import { Department } from '../types';
import { getDepartments, updateDepartment, deleteDepartment, createDepartment } from '../services/api';

function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Department>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDept, setNewDept] = useState({ id: 0, name: '', description: '' });

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
    setEditingId(dept.id);
    setEditForm({ name: dept.name, description: dept.description });
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateDepartment(id, editForm as Omit<Department, 'Id'>);
      await fetchDepartments();
      setEditingId(null);
    } catch (err) {
      console.error('Error updating department:', err);
    }
  };

  const handleDelete = async (id: number) => {
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
      setNewDept({ id: 0, name: '', description: '' });
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
            value={newDept.name}
            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={newDept.description}
            onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
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
            <tr key={dept.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>
                {editingId === dept.id ? (
                  <input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                ) : (
                  dept.name
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === dept.id ? (
                  <input
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                ) : (
                  dept.description
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === dept.id ? (
                  <>
                    <button onClick={() => handleUpdate(dept.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(dept)}>Edit</button>
                    <button onClick={() => handleDelete(dept.id)}>Delete</button>
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