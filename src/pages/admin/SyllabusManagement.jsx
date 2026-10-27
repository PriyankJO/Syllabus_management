import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Trash2, Download, Eye, Edit2 } from 'lucide-react';
import { deleteSyllabus, addSyllabus, updateSyllabus, fetchSyllabus } from '../../store/slices/syllabusSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const SyllabusManagement = () => {
  const syllabusList = useSelector(state => state.syllabus?.syllabus || state.syllabus?.syllabusList) || [];
  const subjects = useSelector(state => state.subjects.subjects) || [];
  const departments = useSelector(state => state.departments?.departments) || [];
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchSyllabus());
    dispatch(fetchSubjects());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSyllabus, setNewSyllabus] = useState({
    _id: '', subjectId: '', title: '', description: '', academicYear: '2026'
  });
  const [file, setFile] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);

  const [filterDept, setFilterDept] = useState('');
  const [filterSubjectCode, setFilterSubjectCode] = useState('');

  const filteredSyllabusList = syllabusList.filter(s => {
    const matchDept = filterDept ? (s.department?._id === filterDept || s.department?.id === filterDept || s.department === filterDept) : true;
    const matchSubj = filterSubjectCode ? (s.subject?.code?.toLowerCase().includes(filterSubjectCode.toLowerCase())) : true;
    return matchDept && matchSubj;
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this syllabus?')) {
      dispatch(deleteSyllabus(id));
      alert('Syllabus deleted successfully');
    }
  };

  const handleEditClick = (syllabus) => {
    setNewSyllabus({ 
      ...syllabus,
      subjectId: syllabus.subject?._id || syllabus.subject?.id || syllabus.subject || ''
    });
    setFile(null); // Clear file since it's optional for edit
    setIsModalOpen(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const subject = subjects.find(s => s._id === newSyllabus.subjectId || s.id === newSyllabus.subjectId);
    if (!subject) {
      alert("Please select a subject.");
      return;
    }

    const formData = new FormData();
    formData.append('subject', subject._id || subject.id);
    if (subject.department) {
      formData.append('department', subject.department?._id || subject.department);
    }
    if (subject.semester) {
      formData.append('semester', subject.semester);
    }
    formData.append('title', newSyllabus.title);
    formData.append('description', newSyllabus.description);
    formData.append('academicYear', newSyllabus.academicYear);
    
    if (file) {
      formData.append('file', file);
    }

    if (newSyllabus._id) {
      // Edit Mode
      dispatch(updateSyllabus({ id: newSyllabus._id, formData }))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          setFile(null);
        })
        .catch(() => {
          // Error handled by interceptor
        });
    } else {
      // Add Mode
      formData.append('syllabusCode', `SYL${Math.floor(Math.random() * 100000)}`);
      dispatch(addSyllabus(formData))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          setFile(null);
        })
        .catch(() => {});
    }
  };

  const handleOpenAddModal = () => {
    setNewSyllabus({ _id: '', subjectId: '', title: '', description: '', academicYear: '2026' });
    setFile(null);
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Subject Code', accessor: 'subjectCode', render: (row) => row.subject?.code || '-' },
    { header: 'Title', accessor: 'title' },
    { header: 'Department', accessor: 'department', render: (row) => row.department?.name || row.department },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Date Added', accessor: 'uploadDate', render: (row) => new Date(row.uploadDate).toLocaleDateString() },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => {
            setSelectedSyllabus(row);
            setViewModalOpen(true);
          }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }} title="View">
            <Eye size={16} />
          </button>
          <button 
            onClick={() => handleEditClick(row)}
            style={{ background: 'none', border: 'none', color: 'var(--color-warning)', cursor: 'pointer' }} title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button onClick={() => {
            const url = row.file.startsWith('/') ? `http://localhost:5000${row.file}` : row.file;
            window.open(url, '_blank');
          }} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer' }} title="Download">
            <Download size={16} />
          </button>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
            onClick={() => handleDelete(row._id || row.id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // Filter subjects for current user if HOD or Faculty
  const userDeptId = user?.department?._id || user?.department?.id || (typeof user?.department === 'string' ? user.department : null);
  const userSubjects = (user?.role === 'HOD' || user?.role === 'FACULTY') && userDeptId
    ? subjects.filter(s => {
        const sDeptId = s.department?._id || s.department?.id || (typeof s.department === 'string' ? s.department : null);
        return sDeptId === userDeptId;
      })
    : subjects;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Syllabus Management & Uploads</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)' }}>
            Manage curriculum documents and upload official syllabus files for each subject.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--color-primary)', color: 'white',
            border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-md)',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
          }}
        >
          <Plus size={18} /> Upload New Syllabus
        </button>
      </div>

      {/* Prominent Quick-Action Upload Card */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
        border: '1px solid #bfdbfe', borderRadius: '12px', padding: '20px 24px',
        marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '15px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', color: '#1e40af', fontSize: '1.15rem' }}>
            Need to Add or Update a Course Syllabus?
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: '1.5' }}>
            You can upload a syllabus document (.pdf, .doc, .docx) for any subject in the curriculum. 
            All currently added syllabus records are displayed in the list below.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 18px', backgroundColor: 'var(--color-secondary)', color: 'white',
            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          <Plus size={18} /> Click Here to Add New Syllabus
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'var(--color-surface)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 600 }}>Filter by Department</label>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 600 }}>Filter by Subject Code</label>
          <input type="text" placeholder="e.g. ENG301" value={filterSubjectCode} onChange={e => setFilterSubjectCode(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
        </div>
      </div>

      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
          Currently Added Syllabuses ({filteredSyllabusList.length})
        </h3>
      </div>

      <DataTable columns={columns} data={filteredSyllabusList} itemsPerPage={10} />

      {/* Upload / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newSyllabus._id ? "Edit Syllabus Details" : "Upload New Course Syllabus"}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 600 }}>1. Select Subject <span style={{ color: 'red' }}>*</span></label>
            <select required value={newSyllabus.subjectId} onChange={e => setNewSyllabus({...newSyllabus, subjectId: e.target.value})} style={{ padding: '9px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <option value="">-- Choose Subject --</option>
              {userSubjects.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.code} - {s.name} ({s.department?.name || 'Dept'})</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 600 }}>2. Syllabus Title <span style={{ color: 'red' }}>*</span></label>
            <input required type="text" placeholder="e.g. Official 2026 Syllabus" value={newSyllabus.title} onChange={e => setNewSyllabus({...newSyllabus, title: e.target.value})} style={{ padding: '9px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 600 }}>3. Academic Regulation / Year</label>
            <input type="text" placeholder="e.g. 2026" value={newSyllabus.academicYear} onChange={e => setNewSyllabus({...newSyllabus, academicYear: e.target.value})} style={{ padding: '9px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 600 }}>4. Description & Key Units</label>
            <textarea placeholder="Describe course scope, module details, or evaluation rules..." value={newSyllabus.description} onChange={e => setNewSyllabus({...newSyllabus, description: e.target.value})} style={{ padding: '9px', borderRadius: '6px', border: '1px solid var(--color-border)', minHeight: '80px' }}></textarea>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 600 }}>
              5. Upload Document (.PDF, .DOC, .DOCX) {!newSyllabus._id && <span style={{ color: 'red' }}>*</span>}
              {newSyllabus._id && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85em', fontWeight: 400 }}> (Leave blank to keep existing file)</span>}
            </label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} required={!newSyllabus._id} style={{ padding: '8px', border: '1px dashed var(--color-primary)', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.04)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '9px 18px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              {newSyllabus._id ? 'Save Changes' : 'Upload Syllabus'}
            </button>
          </div>
        </form>
      </Modal>

      {viewModalOpen && selectedSyllabus && (
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
              <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Syllabus Details</h3>
              <button onClick={() => setViewModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div><strong>Subject:</strong> {selectedSyllabus.subject?.name || '-'}</div>
              <div><strong>Code:</strong> {selectedSyllabus.subject?.code || '-'}</div>
              <div><strong>Department:</strong> {selectedSyllabus.department?.name || '-'}</div>
              <div><strong>Semester:</strong> {selectedSyllabus.semester || '-'}</div>
              <div><strong>Regulation/Year:</strong> {selectedSyllabus.academicYear || '-'}</div>
              <div><strong>Date Added:</strong> {new Date(selectedSyllabus.uploadDate).toLocaleDateString()}</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <strong>Title:</strong> <br/>
              {selectedSyllabus.title}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong>Description:</strong> <br/>
              <p style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                {selectedSyllabus.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditClick(selectedSyllabus);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  backgroundColor: 'var(--color-warning)', color: 'white',
                  border: 'none', padding: '10px 20px', borderRadius: '8px',
                  fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                <Edit2 size={16} /> Edit Syllabus
              </button>
              <a 
                href={selectedSyllabus.file?.startsWith('/') ? `http://localhost:5000${selectedSyllabus.file}` : selectedSyllabus.file} 
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

export default SyllabusManagement;
