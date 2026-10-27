import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { deleteUser, addUser, updateUser, fetchUsers } from '../../store/slices/userSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const StudentManagement = () => {
  const { user } = useSelector(state => state.auth);
  const users = useSelector(state => state.users.users) || [];
  const departments = useSelector(state => state.departments.departments) || [];
  const students = users.filter(u => u.role === 'STUDENT');
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    _id: '', userCode: '', name: '', email: '', department: '', semester: 1, phone: '', status: 'Active'
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      dispatch(deleteUser(id));
    }
  };

  const handleEditClick = (student) => {
    setNewStudent({ 
      ...student,
      department: student.department?._id || student.department?.id || student.department
    });
    setIsModalOpen(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newStudent._id) {
      // Edit mode
      dispatch(updateUser(newStudent));
    } else {
      // Add mode
      const student = {
        ...newStudent,
        userCode: newStudent.userCode || `STU${Math.floor(Math.random() * 10000)}`,
        role: 'STUDENT',
        password: 'TempPassword123'
      };
      delete student._id; // Remove empty _id for creation
      dispatch(addUser(student));
      alert('Student added successfully. Temporary password: TempPassword123');
    }
    setIsModalOpen(false);
  };

  const handleOpenAddModal = () => {
    setNewStudent({ _id: '', userCode: '', name: '', email: '', department: '', semester: 1, phone: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Student Code', accessor: 'userCode' },
    { header: 'Name', accessor: 'name' },
    { header: 'Department', accessor: 'department', render: (row) => row.department?.name || row.department },
    { header: 'Semester', accessor: 'semester' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span style={{
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '0.8rem',
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
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Students</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Manage students and academic records</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--color-secondary)', color: 'white',
            border: 'none', padding: '10px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer'
          }}
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      <DataTable columns={columns} data={students} itemsPerPage={10} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newStudent._id ? "Edit Student" : "Add New Student"}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Student Code (Optional)</label>
            <input type="text" placeholder="Auto-generated if left blank" value={newStudent.userCode || ''} onChange={e => setNewStudent({...newStudent, userCode: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Name</label>
            <input required type="text" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Email</label>
            <input required type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Department</label>
            <select required value={newStudent.department} onChange={e => setNewStudent({...newStudent, department: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <option value="">Select Department...</option>
              {departments.map(dep => (
                <option key={dep._id || dep.id} value={dep._id || dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Semester</label>
              <input required type="number" min="1" max="8" value={newStudent.semester} onChange={e => setNewStudent({...newStudent, semester: parseInt(e.target.value)})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Status</label>
              <select value={newStudent.status} onChange={e => setNewStudent({...newStudent, status: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option>Active</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Student</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
