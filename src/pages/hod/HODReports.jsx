import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSyllabus } from '../../store/slices/syllabusSlice';
import { fetchSyllabusStatus } from '../../store/slices/syllabusStatusSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import DataTable from '../../components/common/DataTable';
import { Book, CheckCircle, Clock } from 'lucide-react';

const HODReports = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { syllabus } = useSelector(state => state.syllabus);
  const { units } = useSelector(state => state.syllabusStatus);
  const { subjects } = useSelector(state => state.subjects);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dispatch(fetchSyllabus()),
      dispatch(fetchSyllabusStatus()),
      dispatch(fetchSubjects())
    ]).then(() => setLoading(false));
  }, [dispatch]);

  // Filter data for the HOD's department
  const userDeptId = user?.department?._id || user?.department?.id || user?.department;

  const departmentSyllabus = syllabus.filter(s => {
    const deptId = s.department?._id || s.department?.id || s.department;
    return deptId === userDeptId;
  });

  const departmentSubjects = subjects.filter(sub => {
    const deptId = sub.department?._id || sub.department?.id || sub.department;
    return deptId === userDeptId;
  });

  // Calculate completion statistics per subject
  const reportData = departmentSubjects.map(subject => {
    const subjectId = subject._id || subject.id;
    // Find syllabus for this subject
    const relatedSyllabus = departmentSyllabus.filter(s => {
      const sSubId = s.subject?._id || s.subject?.id || s.subject;
      return sSubId === subjectId;
    });

    // Find all units for this subject (by direct subject or syllabus relationship)
    const subjectUnits = units.filter(u => {
      const uSubId = u.subject?._id || u.subject?.id || u.subject || u.subjectId;
      if (uSubId === subjectId) return true;
      const uSyllabusId = u.syllabus?._id || u.syllabus?.id || u.syllabus;
      return relatedSyllabus.some(rs => (rs._id || rs.id) === uSyllabusId);
    });

    const totalUnits = subjectUnits.length;
    const completedUnits = subjectUnits.filter(u => u.status === 'Completed').length;
    const pendingUnits = totalUnits - completedUnits;
    const completionPercentage = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

    return {
      id: subjectId,
      subjectName: subject.name,
      semester: subject.semester,
      totalUnits,
      completedUnits,
      pendingUnits,
      completionPercentage,
      facultyName: subject.faculty?.name || 'Unassigned'
    };
  });

  const columns = [
    { header: 'Subject', accessor: 'subjectName' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Assigned Faculty', accessor: 'facultyName' },
    { header: 'Total Units', accessor: 'totalUnits' },
    { 
      header: 'Completion %', 
      accessor: 'completionPercentage',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '10px', height: '8px' }}>
            <div style={{ 
              width: `${row.completionPercentage}%`, 
              backgroundColor: row.completionPercentage === 100 ? 'var(--color-success)' : 'var(--color-primary)', 
              height: '100%', 
              borderRadius: '10px' 
            }} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{row.completionPercentage}%</span>
        </div>
      )
    },
    { 
      header: 'Status', 
      render: (row) => (
        <span style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
          backgroundColor: row.completionPercentage === 100 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          color: row.completionPercentage === 100 ? 'var(--color-success)' : 'var(--color-warning)'
        }}>
          {row.completionPercentage === 100 ? <CheckCircle size={14} /> : <Clock size={14} />}
          {row.completionPercentage === 100 ? 'Completed' : 'In Progress'}
        </span>
      )
    }
  ];

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading Department Reports...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Department Syllabus Report</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Monitor syllabus completion status across all subjects</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', padding: '15px', borderRadius: '50%' }}>
            <Book size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{departmentSubjects.length}</h3>
            <span style={{ color: 'var(--color-text-muted)' }}>Total Subjects</span>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '15px', borderRadius: '50%' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
              {reportData.filter(r => r.completionPercentage === 100).length}
            </h3>
            <span style={{ color: 'var(--color-text-muted)' }}>Completed Subjects</span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--color-text-main)' }}>Syllabus Completion Details</h3>
        <DataTable columns={columns} data={reportData} itemsPerPage={10} />
      </div>
    </div>
  );
};

export default HODReports;
