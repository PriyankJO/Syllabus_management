import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Trash2, Download, Eye, Edit2 } from 'lucide-react';
import { deletePaper, addPaper, updateModelPaper, fetchModelPapers } from '../../store/slices/modelPaperSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ModelPaperManagement = () => {
  const papers = useSelector(state => state.modelPapers?.modelpapers) || [];
  const subjects = useSelector(state => state.subjects?.subjects) || [];
  const users = useSelector(state => state.users?.users) || [];
  const user = useSelector(state => state.auth?.user);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchModelPapers());
    dispatch(fetchSubjects());
    dispatch(fetchUsers());
  }, [dispatch]);

  const tableData = papers.map(paper => {
    const uploadedById = paper.uploadedBy?._id || paper.uploadedBy?.id || paper.uploadedBy;
    const fac = users.find(u => (u._id === uploadedById || u.id === uploadedById));
    return {
      ...paper,
      uploadedByName: fac ? fac.name : (paper.uploadedBy?.name || 'Unknown')
    };
  });

  const userDeptId = user?.department?._id || user?.department?.id || (typeof user?.department === 'string' ? user.department : null);

  const filteredPapers = user?.role === 'HOD' && userDeptId
    ? tableData.filter(p => {
        const pDept = p.department?._id || p.department?.id || (typeof p.department === 'string' ? p.department : null);
        return pDept === userDeptId;
      })
    : user?.role === 'FACULTY' && userDeptId
    ? tableData.filter(p => {
        const pDept = p.department?._id || p.department?.id || (typeof p.department === 'string' ? p.department : null);
        return pDept === userDeptId || (p.uploadedBy?._id || p.uploadedBy) === (user._id || user.id);
      })
    : tableData;

  const availableSubjects = (user?.role === 'HOD' || user?.role === 'FACULTY') && userDeptId
    ? subjects.filter(s => {
        const sDept = s.department?._id || s.department?.id || (typeof s.department === 'string' ? s.department : null);
        return sDept === userDeptId;
      })
    : subjects;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [file, setFile] = useState(null);
  const [newPaper, setNewPaper] = useState({
    _id: '', subjectId: '', title: '', examYear: new Date().getFullYear().toString(), paperType: 'Previous Year', uploadedBy: user?._id || user?.id || ''
  });

  const handleDelete = (id) => {
    if (window.confirm('Delete this model paper?')) {
      dispatch(deletePaper(id));
    }
  };

  const handleEditClick = (paper) => {
    setNewPaper({
      ...paper,
      subjectId: paper.subject?._id || paper.subject?.id || paper.subject || '',
      uploadedBy: paper.uploadedBy?._id || paper.uploadedBy?.id || paper.uploadedBy || user?._id || user?.id || ''
    });
    setFile(null); // optional for edit
    setIsModalOpen(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newPaper._id && !file) {
      alert("Please select a PDF file.");
      return;
    }
    const subject = subjects.find(s => (s._id === newPaper.subjectId || s.id === newPaper.subjectId));
    if (!subject) return;

    const formData = new FormData();
    formData.append('title', newPaper.title);
    formData.append('subject', subject._id || subject.id);
    if (subject.department) {
      formData.append('department', subject.department._id || subject.department.id || subject.department);
    }
    if (subject.semester) {
      formData.append('semester', subject.semester);
    }
    formData.append('examYear', newPaper.examYear);
    formData.append('paperType', newPaper.paperType);
    if (newPaper.uploadedBy) formData.append('uploadedBy', newPaper.uploadedBy);
    
    if (file) {
      formData.append('file', file);
    }
    
    if (newPaper._id) {
      dispatch(updateModelPaper({ id: newPaper._id, formData }))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          setFile(null);
        })
        .catch(() => {});
    } else {
      dispatch(addPaper(formData))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          setFile(null);
        })
        .catch(() => {});
    }
  };

  const handleOpenAddModal = () => {
    setNewPaper({ _id: '', subjectId: '', title: '', examYear: new Date().getFullYear().toString(), paperType: 'Previous Year', uploadedBy: user?._id || user?.id || '' });
    setFile(null);
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Subject', accessor: 'subject', render: (row) => row.subject?.name || row.subject },
    { header: 'Type', accessor: 'paperType' },
    { header: 'Exam Year', accessor: 'examYear' },
    { header: 'Uploaded By', accessor: 'uploadedByName' },
    { header: 'Date', accessor: 'uploadDate', render: (row) => new Date(row.uploadDate).toLocaleDateString() },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {row.file && (
            <button onClick={() => {
              setSelectedPaper(row);
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
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Model Papers</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Manage previous year papers and model questions</p>
        </div>
        <button onClick={handleOpenAddModal} style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #F08A9B 0%, #E9778A 100%)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 'bold'}}>
          <Plus size={18} /> Upload Paper
        </button>
      </div>

      <DataTable columns={columns} data={filteredPapers} itemsPerPage={10} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newPaper._id ? "Edit Model Paper" : "Upload Model Paper"}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Subject</label>
            <select required value={newPaper.subjectId} onChange={e => setNewPaper({...newPaper, subjectId: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <option value="">Select Subject</option>
              {availableSubjects.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name} ({s.code || ''})</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Title</label>
            <input required type="text" value={newPaper.title} onChange={e => setNewPaper({...newPaper, title: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Paper Type</label>
              <select required value={newPaper.paperType} onChange={e => setNewPaper({...newPaper, paperType: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option value="Previous Year">Previous Year</option>
                <option value="Model Paper">Model Paper</option>
                <option value="Internal Assessment">Internal Assessment</option>
                <option value="University Exam">University Exam</option>
                <option value="Question Bank">Question Bank</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Exam Year</label>
              <input required type="text" value={newPaper.examYear} onChange={e => setNewPaper({...newPaper, examYear: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
              <label>Uploaded By (Faculty)</label>
              <select required value={newPaper.uploadedBy || ''} onChange={e => setNewPaper({...newPaper, uploadedBy: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option value="">Select Faculty...</option>
                {users.map(u => <option key={u._id || u.id} value={u._id || u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>File (PDF) {newPaper._id && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85em' }}>(Leave blank to keep current file)</span>}</label>
            <input type="file" required={!newPaper._id} onChange={e => setFile(e.target.files[0])} style={{ padding: '8px', border: '1px dashed var(--color-border)', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {newPaper._id ? 'Save Changes' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>

      {viewModalOpen && selectedPaper && (
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
              <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Model Paper Details</h3>
              <button onClick={() => setViewModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div><strong>Subject:</strong> {selectedPaper.subject?.name || '-'}</div>
              <div><strong>Department:</strong> {selectedPaper.department?.name || '-'}</div>
              <div><strong>Semester:</strong> {selectedPaper.semester || '-'}</div>
              <div><strong>Paper Type:</strong> {selectedPaper.paperType || '-'}</div>
              <div><strong>Exam Year:</strong> {selectedPaper.examYear || '-'}</div>
              <div><strong>Uploaded By:</strong> {selectedPaper.uploadedByName || '-'}</div>
              <div><strong>Date Added:</strong> {new Date(selectedPaper.uploadDate).toLocaleDateString()}</div>
              <div><strong>Downloads:</strong> {selectedPaper.downloadCount || 0}</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <strong>Title:</strong> <br/>
              {selectedPaper.title}
            </div>

            <div style={{ textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditClick(selectedPaper);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  backgroundColor: 'var(--color-warning)', color: 'white',
                  border: 'none', padding: '10px 20px', borderRadius: '8px',
                  fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                <Edit2 size={16} /> Edit Paper
              </button>
              <a 
                href={selectedPaper.file?.startsWith('/') ? `http://localhost:5000${selectedPaper.file}` : selectedPaper.file} 
                download
                target="_blank" rel="noreferrer"
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--color-secondary)', color: 'white',
                  textDecoration: 'none', padding: '10px 20px', borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelPaperManagement;
