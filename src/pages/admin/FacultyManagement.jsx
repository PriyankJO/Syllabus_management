import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { deleteUser, addUser, updateUser, fetchUsers } from '../../store/slices/userSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const FacultyManagement = () => {
  const users = useSelector(state => state.users.users) || [];
  const departments = useSelector(state => state.departments.departments) || [];
  const faculty = users.filter(u => u.role === 'FACULTY' || u.role === 'HOD');
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    _id: '', userCode: '', name: '', email: '', department: '', designation: 'Assistant Professor', role: 'FACULTY', phone: '', status: 'Active'
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      dispatch(deleteUser(id));
    }
  };

  const handleEditClick = (facultyMember) => {
    setNewFaculty({ 
      ...facultyMember,
      department: facultyMember.department?._id || facultyMember.department?.id || facultyMember.department
    });
    setIsModalOpen(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newFaculty._id) {
      // Edit mode
      dispatch(updateUser(newFaculty));
    } else {
      // Add mode
      const fac = {
        ...newFaculty,
        userCode: newFaculty.userCode || `FAC${Math.floor(Math.random() * 10000)}`,
        password: 'TempPassword123'
      };
      delete fac._id;
      dispatch(addUser(fac));
      alert('Faculty added successfully. Temporary password: TempPassword123');
    }
    setIsModalOpen(false);
  };

  const handleOpenAddModal = () => {
    setNewFaculty({ _id: '', userCode: '', name: '', email: '', department: '', designation: 'Assistant Professor', role: 'FACULTY', phone: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Faculty Code', accessor: 'userCode' },
    { header: 'Name', accessor: 'name' },
    { header: 'Role', accessor: 'role' },
    { header: 'Department', accessor: 'department', render: (row) => row.department?.name || row.department },
    { header: 'Designation', accessor: 'designation' },
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
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Faculty Directory</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Manage professors and HODs</p>
        </div>
        <button onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #F08A9B 0%, #E9778A 100%)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 'bold' }}>
          <Plus size={18} /> Add Faculty
        </button>
      </div>

      <DataTable columns={columns} data={faculty} itemsPerPage={10} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newFaculty._id ? "Edit Faculty" : "Add New Faculty"}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Faculty Code (Optional)</label>
            <input type="text" placeholder="Auto-generated if left blank" value={newFaculty.userCode || ''} onChange={e => setNewFaculty({...newFaculty, userCode: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Name</label>
            <input required type="text" value={newFaculty.name} onChange={e => setNewFaculty({...newFaculty, name: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Email</label>
            <input required type="email" value={newFaculty.email} onChange={e => setNewFaculty({...newFaculty, email: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Department</label>
               <select required value={newFaculty.department} onChange={e => setNewFaculty({...newFaculty, department: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                 <option value="">Select Department...</option>
                 {departments.map(dep => <option key={dep._id || dep.id} value={dep._id || dep.id}>{dep.name}</option>)}
               </select>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Role</label>
               <select value={newFaculty.role} onChange={e => setNewFaculty({...newFaculty, role: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                 <option value="FACULTY">Faculty</option>
                 <option value="HOD">HOD</option>
               </select>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Designation</label>
               <select value={newFaculty.designation} onChange={e => setNewFaculty({...newFaculty, designation: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                 <option>Assistant Professor</option>
                 <option>Associate Professor</option>
                 <option>Professor</option>
                 <option>Senior Lecturer</option>
               </select>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Status</label>
               <select value={newFaculty.status} onChange={e => setNewFaculty({...newFaculty, status: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                 <option>Active</option>
                 <option>Disabled</option>
               </select>
             </div>
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

export default FacultyManagement;
