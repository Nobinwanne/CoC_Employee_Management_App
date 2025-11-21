import { useState, useEffect } from 'react';
import { WorkUnit } from '../types';
import { createWorkUnit, getWorkUnits, updateWorkUnit, deleteWorkUnit } from '../services/api';

function DepartmentList() {
  const [workUnits, setWorkUnits] = useState<WorkUnit[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WorkUnit>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWorkUnit, setNewWorkUnit] = useState({ Id: '', WorkUnitName: '', Description: '', Department: '', DepartmentId: ''});

  useEffect(() => {
    fetchWorkUnits();
  }, []);

  const fetchWorkUnits = async () => {
    try {
      const response = await getWorkUnits();
      setWorkUnits(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleEdit = (workUnit: WorkUnit) => {
    setEditingId(workUnit.Id);
    setEditForm({ 
        WorkUnitName: workUnit.WorkUnitName, 
        Description: workUnit.Description, 
        DepartmentId: workUnit.DepartmentId });
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateWorkUnit(id, editForm as Omit<WorkUnit, 'Id'>);
      await fetchWorkUnits();
      setEditingId(null);
    } catch (err) {
      console.error('Error updating workunit:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workunit?')) return;
    try {
      await deleteWorkUnit(id);
      await fetchWorkUnits();
    } catch (err) {
      console.error('Error deleting workunit:', err);
    }
  };

  const handleAdd = async () => {
    try {
      await createWorkUnit(newWorkUnit);
      await fetchWorkUnits();
      setShowAddForm(false);
      setNewWorkUnit({ Id: '', WorkUnitName: '', Description: '', Department: '', DepartmentId: '' });
    } catch (err) {
      console.error('Error creating workunit:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>WorkUnits</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add WorkUnit'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <input
            type="text"
            placeholder="Name"
            value={newWorkUnit.WorkUnitName}
            onChange={(e) => setNewWorkUnit({ ...newWorkUnit, WorkUnitName: e.target.value })}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={newWorkUnit.Description}
            onChange={(e) => setNewWorkUnit({ ...newWorkUnit, Description: e.target.value })}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            placeholder="Department"
            value={newWorkUnit.DepartmentId}
            onChange={(e) => setNewWorkUnit({ ...newWorkUnit, Department: e.target.value })}
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
          {workUnits.map(wu => (
            <tr key={wu.Id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>
                {editingId === wu.Id ? (
                  <input
                    value={editForm.WorkUnitName || ''}
                    onChange={(e) => setEditForm({ ...editForm, WorkUnitName: e.target.value })}
                  />
                ) : (
                  wu.WorkUnitName
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === wu.Id ? (
                  <input
                    value={editForm.Description || ''}
                    onChange={(e) => setEditForm({ ...editForm, Description: e.target.value })}
                  />
                ) : (
                  wu.Description
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {editingId === wu.Id ? (
                  <>
                    <button onClick={() => handleUpdate(wu.Id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(wu)}>Edit</button>
                    <button onClick={() => handleDelete(wu.Id)}>Delete</button>
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