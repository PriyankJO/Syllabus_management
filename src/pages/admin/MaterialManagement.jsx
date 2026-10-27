import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Download, Trash2, Eye, Edit2 } from 'lucide-react';
import { addMaterial, updateMaterial, deleteMaterial, fetchMaterials } from '../../store/slices/materialSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const MaterialManagement = () => {
  const materials = useSelector(state => state.materials.materials) || [];
  const users = useSelector(state => state.users.users) || [];
  const subjects = useSelector(state => state.subjects.subjects) || [];
  const departments = useSelector(state => state.departments.departments) || [];
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchMaterials());
    dispatch(fetchUsers());
    dispatch(fetchSubjects());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const tableData = materials.map(mat => {
    const uploadedById = mat.uploadedBy?._id || mat.uploadedBy?.id || mat.uploadedBy;
    const fac = users.find(u => (u._id === uploadedById || u.id === uploadedById));
    return {
      ...mat,
      uploadedByName: fac ? fac.name : (mat.uploadedBy?.name || 'Unknown')
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  const [filterDept, setFilterDept] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const filteredTableData = tableData.filter(mat => {
    const matchDept = filterDept ? (mat.department?._id === filterDept || mat.department?.id === filterDept || mat.department === filterDept) : true;
    const matchSem = filterSemester ? (mat.semester === parseInt(filterSemester)) : true;
    return matchDept && matchSem;
  });

  const [file, setFile] = useState(null);
  const [newMaterial, setNewMaterial] = useState({
    _id: '', title: '', department: '', subject: '', semester: 1, materialType: 'PDF', uploadedBy: user?._id || user?.id || ''
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      dispatch(deleteMaterial(id));
    }
  };

  const handleEditClick = (material) => {
    setNewMaterial({
      ...material,
      department: material.department?._id || material.department?.id || material.department || '',
      subject: material.subject?._id || material.subject?.id || material.subject || '',
      uploadedBy: material.uploadedBy?._id || material.uploadedBy?.id || material.uploadedBy || user?._id || user?.id || ''
    });
    setFile(null); // Clear file since it's optional for edit
    setIsModalOpen(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newMaterial._id && !file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append('title', newMaterial.title);
    if (newMaterial.department) formData.append('department', newMaterial.department);
    if (newMaterial.subject) formData.append('subject', newMaterial.subject);
    if (newMaterial.semester) formData.append('semester', newMaterial.semester);
    formData.append('materialType', newMaterial.materialType);
    if (newMaterial.uploadedBy) formData.append('uploadedBy', newMaterial.uploadedBy);
    
    if (file) {
      formData.append('file', file);
    }
    
    if (newMaterial._id) {
      dispatch(updateMaterial({ id: newMaterial._id, formData }))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          setFile(null);
        })
        .catch(() => {});
    } else {
      dispatch(addMaterial(formData))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          setFile(null);
        })
        .catch(() => {});
    }
  };

  const handleOpenAddModal = () => {
    setNewMaterial({ _id: '', title: '', department: '', subject: '', semester: 1, materialType: 'PDF', uploadedBy: user?._id || user?.id || '' });
    setFile(null);
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Department', accessor: 'department', render: (row) => row.department?.name || row.department },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Type', accessor: 'materialType' },
    { header: 'Uploaded By', accessor: 'uploadedByName' },
    { header: 'Date Added', accessor: 'uploadDate', render: (row) => new Date(row.uploadDate).toLocaleDateString() },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {row.file && (
            <button onClick={() => {
              setSelectedMaterial(row);
              setViewModalOpen(true);
            }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }} title="View">
              <Eye size={16} />
            </button>
          )}
          <button 
            onClick={() => handleEditClick(row)}
            style={{ background: 'none', border: 'none', color: 'var(--color-warning)', cursor: 'pointer' }} title="Edit"
          >
            <Edit2 size={16} />
          </button>
          {row.file && (
            <a href={row.file.startsWith('/') ? `http://localhost:5000${row.file}` : row.file} download target="_blank" rel="noreferrer" style={{ color: 'var(--color-secondary)' }} title="Download">
              <Download size={16} />
            </a>
          )}
          <button style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }} onClick={() => handleDelete(row._id || row.id)}>
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
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Study Materials</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Manage uploaded notes, PPTs, and references</p>
        </div>
        <button onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #F08A9B 0%, #E9778A 100%)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 'bold' }}>
          <Plus size={18} /> Upload Material
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'var(--color-surface)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>Filter by Department</label>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>Filter by Semester</label>
          <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filteredTableData} itemsPerPage={10} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newMaterial._id ? "Edit Material" : "Upload Material"}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Title</label>
            <input required type="text" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Department</label>
              <select required value={newMaterial.department} onChange={e => setNewMaterial({...newMaterial, department: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option value="">Select Department...</option>
                {departments.map(dep => <option key={dep._id || dep.id} value={dep._id || dep.id}>{dep.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Subject</label>
              <select required value={newMaterial.subject} onChange={e => setNewMaterial({...newMaterial, subject: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option value="">Select Subject...</option>
                {subjects.map(sub => <option key={sub._id || sub.id} value={sub._id || sub.id}>{sub.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Semester</label>
              <input required type="number" min="1" max="8" value={newMaterial.semester} onChange={e => setNewMaterial({...newMaterial, semester: parseInt(e.target.value)})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Material Type</label>
              <select required value={newMaterial.materialType} onChange={e => setNewMaterial({...newMaterial, materialType: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option value="PDF">PDF Document</option>
                <option value="Word">Word Document</option>
                <option value="PPT">PowerPoint (PPT)</option>
                <option value="Excel">Excel Spreadsheet</option>
                <option value="Image">Image (JPG/PNG)</option>
                <option value="Video">Video Link</option>
                <option value="Zip">Zip Archive</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Uploaded By (Faculty)</label>
              <select required value={newMaterial.uploadedBy || ''} onChange={e => setNewMaterial({...newMaterial, uploadedBy: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option value="">Select Faculty...</option>
                {users.map(u => <option key={u._id || u.id} value={u._id || u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Upload File {newMaterial._id && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85em' }}>(Leave blank to keep current file)</span>}</label>
            <input type="file" required={!newMaterial._id} onChange={e => setFile(e.target.files[0])} style={{ padding: '8px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {newMaterial._id ? 'Save Changes' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>

      {viewModalOpen && selectedMaterial && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '12px',
            width: '90%', maxWidth: '600px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Material Details</h3>
              <button onClick={() => setViewModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div><strong>Subject:</strong> {selectedMaterial.subject?.name || '-'}</div>
              <div><strong>Department:</strong> {selectedMaterial.department?.name || '-'}</div>
              <div><strong>Semester:</strong> {selectedMaterial.semester || '-'}</div>
              <div><strong>Material Type:</strong> {selectedMaterial.materialType || '-'}</div>
              <div><strong>Uploaded By:</strong> {selectedMaterial.uploadedByName || '-'}</div>
              <div><strong>Date Added:</strong> {new Date(selectedMaterial.uploadDate).toLocaleDateString()}</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <strong>Title:</strong> <br/>
              {selectedMaterial.title}
            </div>

            <div style={{ textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditClick(selectedMaterial);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  backgroundColor: 'var(--color-warning)', color: 'white',
                  border: 'none', padding: '10px 20px', borderRadius: '8px',
                  fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                <Edit2 size={16} /> Edit Material
              </button>
              <a 
                href={selectedMaterial.file?.startsWith('/') ? `http://localhost:5000${selectedMaterial.file}` : selectedMaterial.file} 
                download
                target="_blank" rel="noreferrer"
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--color-secondary)', color: 'white',
                  textDecoration: 'none', padding: '10px 20px', borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialManagement;
