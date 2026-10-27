import React, { useState } from 'react';
import { Download, Filter, Eye, X, BookOpen, Check, FileText } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { useSelector, useDispatch } from 'react-redux';
import { fetchModelPapers } from '../../store/slices/modelPaperSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';

const StudentModelPapers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [paperTypeFilter, setPaperTypeFilter] = useState('All');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadMsg, setDownloadMsg] = useState(null);
  
  const dispatch = useDispatch();
  const papers = useSelector(state => state.modelPapers?.modelpapers || state.modelpapers?.modelpapers) || [];
  const departments = useSelector(state => state.departments.departments) || [];

  React.useEffect(() => {
    dispatch(fetchModelPapers());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || paper.department === departmentFilter || (paper.department && paper.department.name === departmentFilter);
    const matchesType = paperTypeFilter === 'All' || paper.paperType === paperTypeFilter;
    
    return matchesSearch && matchesDept && matchesType;
  });

  const handleView = (paper) => {
    setSelectedPaper(paper);
    setIsViewModalOpen(true);
  };

  const handleDownload = async (paper) => {
    if (!paper?.file) {
      alert("No file available for download.");
      return;
    }

    const paperId = paper._id || paper.id;
    setDownloadingId(paperId);

    try {
      const fileUrl = paper.file.startsWith('/') 
        ? `http://localhost:5000${paper.file}` 
        : paper.file;
      
      const fileExt = paper.file.split('.').pop()?.split('?')[0] || 'pdf';
      const safeTitle = (paper.title || 'model_paper').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'model_paper';
      const downloadFilename = `${safeTitle}.${fileExt}`;

      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadMsg(`Downloading "${downloadFilename}" to your device...`);
    } catch {
      const fallbackUrl = paper.file.startsWith('/') 
        ? `http://localhost:5000${paper.file}` 
        : paper.file;
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.setAttribute('download', `${paper.title || 'paper'}.pdf`);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadMsg(`Download started for "${paper.title}".`);
    } finally {
      setDownloadingId(null);
      setTimeout(() => setDownloadMsg(null), 3500);
    }
  };

  const getFileUrl = (path) => {
    if (!path) return '';
    return path.startsWith('/') ? `http://localhost:5000${path}` : path;
  };

  const isPdf = (file) => {
    if (!file) return false;
    return file.toLowerCase().endsWith('.pdf') || file.includes('.pdf?');
  };

  const columns = [
    { accessor: 'title', header: 'Paper Title' },
    { accessor: 'department', header: 'Department', render: (row) => row.department?.name || row.department },
    { accessor: 'semester', header: 'Semester', render: (row) => `Sem ${row.semester || '-'}` },
    { 
      accessor: 'paperType', 
      header: 'Type',
      render: (row) => (
        <span style={{
          padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
          background: 'rgba(236, 72, 153, 0.1)', color: '#db2777'
        }}>
          {row.paperType || 'Model Paper'}
        </span>
      )
    },
    { accessor: 'examYear', header: 'Year' },
    { 
      accessor: 'actions', 
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '6px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem',
              fontWeight: 600
            }}
            title="View Paper Online (Read only)"
            onClick={() => handleView(row)}
          >
            <Eye size={14} /> View
          </button>
          <button 
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '6px 12px', background: 'var(--color-success-bg)', color: 'var(--color-success-text)',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: downloadingId === (row._id || row.id) ? 'wait' : 'pointer',
              fontSize: '0.85rem', fontWeight: 600
            }}
            disabled={downloadingId === (row._id || row.id)}
            title="Download Paper File"
            onClick={() => handleDownload(row)}
          >
            <Download size={14} /> {downloadingId === (row._id || row.id) ? 'Downloading...' : 'Download'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ animation: 'fadeUp 0.5s ease-out forwards', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.75rem' }}>Model Papers & Question Banks</h1>
        <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-text-muted)' }}>
          Access annual and semester-wise model questions for exam preparation. Click <strong>View</strong> to preview, or <strong>Download</strong> to save the file.
        </p>
      </div>

      {downloadMsg && (
        <div style={{
          padding: '10px 16px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)',
          borderRadius: '8px', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Check size={18} color="var(--color-success)" /> {downloadMsg}
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', 
        background: 'var(--color-surface)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)', alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
          <Filter size={18} /> <span style={{ fontWeight: 600 }}>Filters:</span>
        </div>
        <select 
          value={departmentFilter} 
          onChange={(e) => setDepartmentFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
        >
          <option value="All">All Departments</option>
          {departments.map(d => (
            <option key={d._id || d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <select 
          value={paperTypeFilter} 
          onChange={(e) => setPaperTypeFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
        >
          <option value="All">All Paper Types</option>
          <option value="Previous Year">Previous Year</option>
          <option value="Model Paper">Model Paper</option>
          <option value="Internal Assessment">Internal Assessment</option>
          <option value="University Exam">University Exam</option>
          <option value="Question Bank">Question Bank</option>
        </select>
      </div>

      <DataTable 
        data={filteredPapers}
        columns={columns}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      {/* Model Paper View Modal: Read only preview */}
      {isViewModalOpen && selectedPaper && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', width: '95%', maxWidth: '950px',
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)', overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px', borderRadius: '8px', backgroundColor: '#fce7f3',
                  color: '#db2777', display: 'flex'
                }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.2rem' }}>
                    {selectedPaper.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '2px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <span>{selectedPaper.subject?.name || 'Subject'}</span>
                    <span>•</span>
                    <span>Year: {selectedPaper.examYear || '-'}</span>
                    <span>•</span>
                    <span style={{ 
                      padding: '2px 6px', borderRadius: '4px', background: '#fdf2f8', color: '#be185d',
                      fontWeight: 600, fontSize: '0.78rem' 
                    }}>
                      {selectedPaper.paperType || 'Question Paper'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px',
                  backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600
                }}>
                  Reading View Only
                </span>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#64748b', display: 'flex', padding: '6px', borderRadius: '6px'
                  }}
                  title="Close Viewer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#f1f5f9' }}>
              {selectedPaper.file ? (
                <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {isPdf(selectedPaper.file) ? (
                    <iframe
                      src={`${getFileUrl(selectedPaper.file)}#toolbar=0`}
                      title={selectedPaper.title}
                      width="100%"
                      height="580px"
                      style={{ border: 'none', display: 'block' }}
                    />
                  ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'white' }}>
                      <FileText size={56} color="var(--color-primary)" style={{ marginBottom: '15px' }} />
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-main)' }}>
                        Question Paper Document
                      </h4>
                      <p style={{ margin: '0 0 20px 0', color: 'var(--color-text-muted)' }}>
                        Click below to download and view this question paper.
                      </p>
                      <button
                        onClick={() => handleDownload(selectedPaper)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          padding: '10px 22px', backgroundColor: 'var(--color-primary)', color: 'white',
                          border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                        }}
                      >
                        <Download size={18} /> Download Model Paper
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', backgroundColor: 'white', borderRadius: '8px' }}>
                  No digital document file attached to this paper record.
                </div>
              )}
            </div>

            <div style={{
              padding: '14px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Previewing document. The file will only download when you click "Download File".
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  style={{
                    padding: '8px 18px', backgroundColor: 'white', color: '#475569',
                    border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                {selectedPaper.file && (
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedPaper)}
                    disabled={downloadingId === (selectedPaper._id || selectedPaper.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 20px', backgroundColor: 'var(--color-success)', color: 'white',
                      border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Download size={16} /> 
                    {downloadingId === (selectedPaper._id || selectedPaper.id) ? 'Downloading...' : 'Download File'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentModelPapers;
