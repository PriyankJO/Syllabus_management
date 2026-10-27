import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { addDepartment, updateDepartment, deleteDepartment, fetchDepartments } from '../../store/slices/departmentSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const DepartmentManagement = () => {
  const departments = useSelector(state => state.departments.departments) || [];
  const users = useSelector(state => state.users.users) || [];
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchUsers());
  }, [dispatch]);
  
  // Need to get HOD names for the table
  const tableData = departments.map(dep => {
    const hodId = dep.hod?._id || dep.hod?.id || dep.hod;
    const hod = users.find(u => (u._id === hodId || u.id === hodId));
    return {
      ...dep,
      hodName: dep.hod?.name || (hod ? hod.name : 'Unassigned')
    };
  });

  const availableHODs = users.filter(u => u.role === 'HOD' || u.role === 'FACULTY');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    _id: '', departmentCode: '', name: '', code: '', hod: '', status: 'Active'
  });

  const handleEditClick = (department) => {
    setNewDepartment({ 
      ...department,
      hod: department.hod?._id || department.hod?.id || department.hod || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      dispatch(deleteDepartment(id));
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newDepartment._id) {
      dispatch(updateDepartment(newDepartment));
    } else {
      const dep = { 
        ...newDepartment,
        departmentCode: newDepartment.departmentCode || `DEP${Math.floor(Math.random() * 10000)}`
      };
      delete dep._id;
      dispatch(addDepartment(dep));
    }
    setIsModalOpen(false);
  };

  const handleOpenAddModal = () => {
    setNewDepartment({ _id: '', departmentCode: '', name: '', code: '', hod: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Department Name', accessor: 'name' },
    { header: 'HOD', accessor: 'hodName' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span style={{
          padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
          backgroundColor: row.status === 'Active' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
          color: row.status === 'Active' ? 'var(--color-success)' : 'var(--color-danger)'
        }}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer' }}
            onClick={() => handleEditClick(row)}
          >
            <Edit2 size={16} />
          </button>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
            onClick={() => handleDelete(row._id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Departments</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Manage college departments and HODs</p>
        </div>
        <button 
          onClick={handleOpenAddModal} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-secondary)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} /> Add Department
        </button>
      </div>

      <DataTable columns={columns} data={tableData} itemsPerPage={10} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newDepartment._id ? "Edit Department" : "Add New Department"}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Department ID / Code (Optional)</label>
            <input type="text" placeholder="Auto-generated if left blank (e.g. DEP001)" value={newDepartment.departmentCode || ''} onChange={e => setNewDepartment({...newDepartment, departmentCode: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Department Name</label>
            <input required type="text" value={newDepartment.name} onChange={e => setNewDepartment({...newDepartment, name: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Code</label>
              <input required type="text" value={newDepartment.code} onChange={e => setNewDepartment({...newDepartment, code: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Status</label>
              <select value={newDepartment.status} onChange={e => setNewDepartment({...newDepartment, status: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option>Active</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Assign HOD (Optional)</label>
            <select value={newDepartment.hod} onChange={e => setNewDepartment({...newDepartment, hod: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <option value="">Select HOD...</option>
              {availableHODs.map(hod => (
                <option key={hod._id || hod.id} value={hod._id || hod.id}>{hod.name} ({hod.role})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
