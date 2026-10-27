import React, { useState } from 'react';
import { Search, BookOpen, Download, Filter } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { fetchSyllabus } from '../../store/slices/syllabusSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';

const StudentSubjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [subjectCodeInput, setSubjectCodeInput] = useState('');
  
  const dispatch = useDispatch();
  const subjects = useSelector(state => state.subjects.subjects);
  const departments = useSelector(state => state.departments.departments);
  const syllabusList = useSelector(state => state.syllabus.syllabus);

  React.useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchDepartments());
    dispatch(fetchSyllabus());
  }, [dispatch]);

  // Handle direct subject code entry
  const handleCodeSearch = (e) => {
    e.preventDefault();
    if (subjectCodeInput.trim()) {
      setSearchTerm(subjectCodeInput.trim().toUpperCase());
      setDepartmentFilter('All');
      setSemesterFilter('All');
    }
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || sub.department === departmentFilter || (sub.department && sub.department.name === departmentFilter);
    const matchesSem = semesterFilter === 'All' || sub.semester.toString() === semesterFilter;
    
    return matchesSearch && matchesDept && matchesSem;
  });

  const getSyllabusForSubject = (subjectId) => {
    return syllabusList.find(s => (s.subject && (s.subject._id === subjectId || s.subject === subjectId)) || s.subjectId === subjectId);
  };

  const columns = [
    { accessor: 'code', header: 'Code' },
    { accessor: 'name', header: 'Subject Name' },
    { accessor: 'department', header: 'Department', render: (row) => row.department?.name || row.department },
    { accessor: 'semester', header: 'Semester' },
    { accessor: 'credits', header: 'Credits' },
    { 
      accessor: 'actions', 
      header: 'Actions',
      render: (row) => {
        const syllabus = getSyllabusForSubject(row._id || row.id);
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => {
                if (syllabus) {
                  const url = syllabus.file.startsWith('/') ? `http://localhost:5000${syllabus.file}` : syllabus.file;
                  window.open(url, '_blank');
                } else {
                  alert('Syllabus not found');
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem'
              }}
              title="View Syllabus"
            >
              <BookOpen size={14} /> View
            </button>
            {syllabus && (
              <button 
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', background: 'var(--color-success-bg)', color: 'var(--color-success-text)',
                  border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem'
                }}
                title="Download Syllabus"
                onClick={() => {
                  const url = syllabus.file.startsWith('/') ? `http://localhost:5000${syllabus.file}` : syllabus.file;
                  window.open(url, '_blank');
                }}
              >
                <Download size={14} /> Download
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ animation: 'fadeUp 0.5s ease-out forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.75rem' }}>My Subjects</h1>
          <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-text-muted)' }}>
            View and download syllabus for your registered subjects.
          </p>
        </div>
        
        {/* Direct Subject Code Entry */}
        <form onSubmit={handleCodeSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Enter Subject Code (e.g. ENG301)"
              value={subjectCodeInput}
              onChange={(e) => setSubjectCodeInput(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>
            Find
          </button>
        </form>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', 
        background: 'var(--color-surface)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)', alignItems: 'center'
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
        data={filteredSubjects}
        columns={columns}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />
    </div>
  );
};

export default StudentSubjects;
