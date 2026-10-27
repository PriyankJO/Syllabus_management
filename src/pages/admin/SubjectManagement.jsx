import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { addSubject, updateSubject, deleteSubject, fetchSubjects } from '../../store/slices/subjectSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const SubjectManagement = () => {
  const { user } = useSelector(state => state.auth);
  const subjects = useSelector(state => state.subjects.subjects) || [];
  const users = useSelector(state => state.users.users) || [];
  const departments = useSelector(state => state.departments.departments) || [];
  const facultyList = users.filter(u => u.role === 'FACULTY' || u.role === 'HOD');
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const userDeptId = user?.department?._id || user?.department?.id || (typeof user?.department === 'string' ? user.department : null);
  const displayedSubjects = user?.role === 'HOD' && userDeptId
    ? subjects.filter(sub => {
        const subDeptId = sub.department?._id || sub.department?.id || (typeof sub.department === 'string' ? sub.department : null);
        return subDeptId === userDeptId;
      })
    : user?.role === 'FACULTY'
    ? subjects.filter(sub => {
        const facId = sub.faculty?._id || sub.faculty?.id || sub.faculty;
        const subDeptId = sub.department?._id || sub.department?.id || (typeof sub.department === 'string' ? sub.department : null);
        return (facId && (facId === user._id || facId === user.id)) || (userDeptId && subDeptId === userDeptId);
      })
    : subjects;

  const tableData = displayedSubjects.map(sub => {
    const facultyId = sub.faculty?._id || sub.faculty?.id || sub.faculty;
    const fac = users.find(u => (u._id === facultyId || u.id === facultyId));
    return {
      ...sub,
      facultyName: sub.faculty?.name || (fac ? fac.name : 'Unassigned')
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    _id: '', code: '', name: '', department: '', semester: 1, credits: 3, faculty: '', status: 'Active'
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      dispatch(deleteSubject(id));
    }
  };

  const handleEditClick = (subject) => {
    setNewSubject({ 
      ...subject, 
      department: subject.department?._id || subject.department?.id || subject.department,
      faculty: subject.faculty?._id || subject.faculty?.id || subject.faculty
    });
    setIsModalOpen(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newSubject._id) {
      dispatch(updateSubject(newSubject));
    } else {
      const subject = { 
        ...newSubject,
        subjectCode: newSubject.subjectCode || `SUB${Math.floor(Math.random() * 10000)}`
      };
      delete subject._id;
      dispatch(addSubject(subject));
    }
    setIsModalOpen(false);
  };

  const handleOpenAddModal = () => {
    setNewSubject({ 
      _id: '', code: '', name: '', 
      department: (user?.role === 'HOD' && userDeptId) ? userDeptId : '', 
      semester: 1, credits: 3, faculty: '', status: 'Active' 
    });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Subject Code', accessor: 'code' },
    { header: 'Name', accessor: 'name' },
    { header: 'Department', accessor: 'department', render: (row) => row.department?.name || row.department },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Credits', accessor: 'credits' },
    { header: 'Faculty', accessor: 'facultyName' },
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
            title="Edit Details"
          >
            <Edit2 size={16} />
          </button>
          {user?.role !== 'FACULTY' && (
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
              onClick={() => handleDelete(row._id)}
              title="Delete Subject"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>
            {user?.role === 'FACULTY' ? 'My Subjects' : user?.role === 'HOD' ? 'Department Subjects' : 'Subjects'}
          </h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            {user?.role === 'FACULTY' 
              ? 'Your assigned course curriculum and subjects' 
              : user?.role === 'HOD' 
              ? 'Manage course curriculum, faculty allocation, and subjects for your department' 
              : 'Manage course curriculum and assignments'}
          </p>
        </div>
        {user?.role !== 'FACULTY' && (
          <button onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #F08A9B 0%, #E9778A 100%)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 'bold' }}>
            <Plus size={18} /> Add Subject
          </button>
        )}
      </div>

      <DataTable columns={columns} data={tableData} itemsPerPage={10} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newSubject._id ? "Edit Subject" : "Add Subject"}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Subject Code</label>
               <input required type="text" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 2 }}>
               <label>Name</label>
               <input required type="text" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
             </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Department</label>
               <select required value={newSubject.department} onChange={e => setNewSubject({...newSubject, department: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                 <option value="">Select Department...</option>
                 {departments.map(dep => <option key={dep._id || dep.id} value={dep._id || dep.id}>{dep.name}</option>)}
               </select>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Faculty</label>
               <select required value={newSubject.faculty} onChange={e => setNewSubject({...newSubject, faculty: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                 <option value="">Select Faculty...</option>
                 {facultyList.map(fac => <option key={fac._id || fac.id} value={fac._id || fac.id}>{fac.name}</option>)}
               </select>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Semester</label>
               <input required type="number" min="1" max="8" value={newSubject.semester} onChange={e => setNewSubject({...newSubject, semester: parseInt(e.target.value)})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Credits</label>
               <input required type="number" min="1" max="5" value={newSubject.credits} onChange={e => setNewSubject({...newSubject, credits: parseInt(e.target.value)})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
               <label>Status</label>
               <select value={newSubject.status} onChange={e => setNewSubject({...newSubject, status: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                 <option>Active</option>
                 <option>Disabled</option>
               </select>
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Subject</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectManagement;
