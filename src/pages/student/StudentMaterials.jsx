import React, { useState } from 'react';
import { Download, Eye, Filter, X, FileText, Check, AlertCircle, BookOpen } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMaterials } from '../../store/slices/materialSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';

const StudentMaterials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadMsg, setDownloadMsg] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const materials = useSelector(state => state.materials.materials) || [];
  const departments = useSelector(state => state.departments.departments) || [];

  React.useEffect(() => {
    dispatch(fetchMaterials());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Determine student's department ID and name
  const userDeptId = user?.department?._id || user?.department?.id || (typeof user?.department === 'string' ? user.department : null);
  const userDeptObj = departments.find(d => (d._id || d.id) === userDeptId || d.name === userDeptId);
  const departmentName = userDeptObj?.name || user?.department?.name || 'My Department';

  const filteredMaterials = materials.filter(mat => {
    // Only allow notes from student's department
    const matDeptId = mat.department?._id || mat.department?.id || (typeof mat.department === 'string' ? mat.department : null);
    const matDeptName = mat.department?.name || mat.department;
    
    const matchesUserDept = userDeptId 
      ? (matDeptId === userDeptId || matDeptName === departmentName)
      : true;

    const matchesSearch = mat.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (mat.description && mat.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSem = semesterFilter === 'All' || mat.semester?.toString() === semesterFilter;
    
    return matchesUserDept && matchesSearch && matchesSem;
  });

  // Action: VIEW ONLY (Opens modal viewer without downloading)
  const handleView = (material) => {
    setSelectedMaterial(material);
    setIsViewModalOpen(true);
  };

  // Action: DOWNLOAD ONLY (Directly downloads the material file to device)
  const handleDownload = async (material) => {
    if (!material?.file) {
      alert("No file attached to this material.");
      return;
    }

    const materialId = material._id || material.id;
    setDownloadingId(materialId);

    try {
      const fileUrl = material.file.startsWith('/') 
        ? `http://localhost:5000${material.file}` 
        : material.file;
      
      const fileExt = material.file.split('.').pop()?.split('?')[0] || 'pdf';
      const safeTitle = (material.title || 'study_material').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'material';
      const downloadFilename = `${safeTitle}.${fileExt}`;

      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error('Failed to fetch file');
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
      // Fallback: direct download link with download attribute
      const fallbackUrl = material.file.startsWith('/') 
        ? `http://localhost:5000${material.file}` 
        : material.file;
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.setAttribute('download', `${material.title || 'material'}.pdf`);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadMsg(`Download started for "${material.title}".`);
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

  const isImage = (file) => {
    if (!file) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i.test(file);
  };

  const columns = [
    { accessor: 'title', header: 'Material Title' },
    { accessor: 'department', header: 'Department', render: (row) => row.department?.name || row.department },
    { accessor: 'semester', header: 'Semester', render: (row) => `Sem ${row.semester || '-'}` },
    { 
      accessor: 'materialType', 
      header: 'Type',
      render: (row) => (
        <span style={{ 
          padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
          background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)'
        }}>
          {row.materialType || 'Notes'}
        </span>
      )
    },
    { 
      accessor: 'uploadDate', 
      header: 'Date Uploaded',
      render: (row) => row.uploadDate ? new Date(row.uploadDate).toLocaleDateString() : '-'
    },
    { 
      accessor: 'actions', 
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* View Button - ONLY opens preview, does NOT download */}
          <button 
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem',
              fontWeight: 600
            }}
            title="View material online (No download)"
            onClick={() => handleView(row)}
          >
            <Eye size={14} /> View
          </button>

          {/* Download Button - Downloads file directly to student device */}
          <button 
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', background: 'var(--color-success-bg)', color: 'var(--color-success-text)',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: downloadingId === (row._id || row.id) ? 'wait' : 'pointer',
              fontSize: '0.85rem', fontWeight: 600
            }}
            disabled={downloadingId === (row._id || row.id)}
            title="Download material to device"
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
        <h1 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.75rem' }}>Department Study Materials</h1>
        <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-text-muted)' }}>
          Access study materials, presentations, and lecture notes for your department ({departmentName}). Click <strong>View</strong> to read on screen, or <strong>Download</strong> to save the file.
        </p>
      </div>

      {downloadMsg && (
        <div style={{
          padding: '10px 16px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)',
          borderRadius: '8px', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
        }}>
          <Check size={18} color="var(--color-success)" /> {downloadMsg}
        </div>
      )}

      {/* Filters & Department Indicator */}
      <div style={{ 
        display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', 
        background: 'var(--color-surface)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)', alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)',
          borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem'
        }}>
          <span>Department:</span> <strong>{departmentName}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
          <Filter size={18} /> <span style={{ fontWeight: 600 }}>Filter by Semester:</span>
        </div>
        <select 
          value={semesterFilter} 
          onChange={(e) => setSemesterFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
        >
          <option value="All">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => (
            <option key={s} value={s.toString()}>Semester {s}</option>
          ))}
        </select>
      </div>

      <DataTable 
        data={filteredMaterials}
        columns={columns}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      {/* DEDICATED MATERIAL VIEWER MODAL: VIEW ONLY */}
      {isViewModalOpen && selectedMaterial && (
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
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)', display: 'flex'
                }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.2rem' }}>
                    {selectedMaterial.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '2px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <span>{selectedMaterial.subject?.name || 'Subject'}</span>
                    <span>•</span>
                    <span>Sem {selectedMaterial.semester || '-'}</span>
                    <span>•</span>
                    <span style={{ 
                      padding: '2px 6px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1',
                      fontWeight: 600, fontSize: '0.78rem' 
                    }}>
                      {selectedMaterial.materialType || 'Document'}
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

            {/* Modal Body: Document Preview */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#f1f5f9' }}>
              {selectedMaterial.description && (
                <div style={{
                  backgroundColor: 'white', padding: '12px 16px', borderRadius: '8px',
                  marginBottom: '15px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155'
                }}>
                  <strong>Description: </strong> {selectedMaterial.description}
                </div>
              )}

              {selectedMaterial.file ? (
                <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {isPdf(selectedMaterial.file) ? (
                    <iframe
                      src={`${getFileUrl(selectedMaterial.file)}#toolbar=0`}
                      title={selectedMaterial.title}
                      width="100%"
                      height="580px"
                      style={{ border: 'none', display: 'block' }}
                    />
                  ) : isImage(selectedMaterial.file) ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <img
                        src={getFileUrl(selectedMaterial.file)}
                        alt={selectedMaterial.title}
                        style={{ maxWidth: '100%', maxHeight: '580px', objectFit: 'contain', borderRadius: '6px' }}
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'white' }}>
                      <FileText size={56} color="var(--color-primary)" style={{ marginBottom: '15px' }} />
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-main)' }}>
                        Document Preview Mode
                      </h4>
                      <p style={{ margin: '0 0 20px 0', color: 'var(--color-text-muted)', maxWidth: '450px', marginInline: 'auto' }}>
                        This {selectedMaterial.materialType || 'document'} file format is ready for download. You can download and open it directly with your installed application.
                      </p>
                      <button
                        onClick={() => handleDownload(selectedMaterial)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          padding: '10px 22px', backgroundColor: 'var(--color-primary)', color: 'white',
                          border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                        }}
                      >
                        <Download size={18} /> Download This Document
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', backgroundColor: 'white', borderRadius: '8px' }}>
                  <AlertCircle size={40} color="#f59e0b" style={{ marginBottom: '10px' }} />
                  <p style={{ margin: 0 }}>No digital file attached to this material record.</p>
                </div>
              )}
            </div>

            {/* Modal Footer: Explicit Download Option */}
            <div style={{
              padding: '14px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Currently in view mode. The file will only download if you click "Download File".
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
                {selectedMaterial.file && (
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedMaterial)}
                    disabled={downloadingId === (selectedMaterial._id || selectedMaterial.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 20px', backgroundColor: 'var(--color-success)', color: 'white',
                      border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Download size={16} /> 
                    {downloadingId === (selectedMaterial._id || selectedMaterial.id) ? 'Downloading...' : 'Download File'}
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

export default StudentMaterials;
