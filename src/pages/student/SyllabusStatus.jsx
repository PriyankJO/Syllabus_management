import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, Download, Clock, CheckCircle } from 'lucide-react';
import { fetchSyllabusStatus } from '../../store/slices/syllabusStatusSlice';
import timelineStyles from '../faculty/SyllabusCompletion.module.css';


const SyllabusStatus = () => {
  const { user } = useSelector(state => state.auth);
  const { subjects } = useSelector(state => state.subjects);
  const { units } = useSelector(state => state.syllabusStatus);
  const syllabuses = useSelector(state => state.syllabus?.syllabus || state.syllabus?.syllabuses) || [];

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSyllabusStatus());
  }, [dispatch]);

  const userDeptId = user?.department?._id || user?.department?.id || (typeof user?.department === 'string' ? user.department : null);

  const mySubjects = subjects.filter(s => {
    const sDeptId = s.department?._id || s.department?.id || (typeof s.department === 'string' ? s.department : null);
    const matchDept = userDeptId ? sDeptId === userDeptId : true;
    const matchSem = user?.semester ? String(s.semester) === String(user.semester) : true;
    return matchDept && matchSem;
  });

  const [selectedSubject, setSelectedSubject] = useState(mySubjects[0]?._id || mySubjects[0]?.id || '');

  useEffect(() => {
    if (mySubjects.length > 0 && (!selectedSubject || !mySubjects.some(s => (s._id || s.id) === selectedSubject))) {
      setSelectedSubject(mySubjects[0]._id || mySubjects[0].id);
    }
  }, [mySubjects, selectedSubject]);

  const subjectUnits = units.filter(u => {
    const unitSubjectId = u.subject?._id || u.subject?.id || u.subject || u.subjectId;
    return unitSubjectId === selectedSubject;
  }).sort((a, b) => a.unitNumber - b.unitNumber);
  
  const currentSyllabus = syllabuses ? syllabuses.find(s => {
    const sId = s.subject?._id || s.subject?.id || (typeof s.subject === 'string' ? s.subject : null) || s.subjectId;
    return sId === selectedSubject;
  }) : null;

  const handleDownloadSyllabus = async (syllabus) => {
    if (!syllabus?.file) return;
    try {
      const fileUrl = syllabus.file.startsWith('/') ? `http://localhost:5000${syllabus.file}` : syllabus.file;
      const ext = syllabus.file.split('.').pop()?.split('?')[0] || 'pdf';
      const cleanName = `${(syllabus.title || 'Syllabus').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'syllabus'}.${ext}`;
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const url = syllabus.file.startsWith('/') ? `http://localhost:5000${syllabus.file}` : syllabus.file;
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', '');
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.5s ease-out forwards', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.75rem' }}>Syllabus & Status</h1>
        <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-text-muted)' }}>
          View your syllabus and track course progression based on faculty updates.
        </p>
      </div>
      
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', 
        background: 'var(--color-surface)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: '1 1 300px' }}>
          <label style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Select Subject:</label>
          <select 
            value={selectedSubject} 
            onChange={e => setSelectedSubject(e.target.value)}
            style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flex: 1, outline: 'none' }}
          >
            <option value="">Select a Subject</option>
            {mySubjects.map(s => (
              <option key={s._id || s.id} value={s._id || s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        {currentSyllabus && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => {
                const url = currentSyllabus.file.startsWith('/') ? `http://localhost:5000${currentSyllabus.file}` : currentSyllabus.file;
                window.open(url, '_blank');
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600
              }}
              title="View Syllabus Online"
            >
              <BookOpen size={18} /> View Syllabus
            </button>
            <button 
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'var(--color-success-bg)', color: 'var(--color-success-text)',
                border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600
              }}
              title="Download Syllabus to Device"
              onClick={() => handleDownloadSyllabus(currentSyllabus)}
            >
              <Download size={18} /> Download
            </button>
          </div>
        )}
      </div>

      <div className={timelineStyles.timeline}>
        {subjectUnits.length > 0 ? subjectUnits.map((unit, index) => {
          const isCompleted = unit.status === 'Completed';
          const isFirstPending = !isCompleted && (index === 0 || subjectUnits[index - 1].status === 'Completed');
          const itemClass = index % 2 === 0 ? timelineStyles.left : timelineStyles.right;
          
          return (
            <div key={unit._id || unit.id} className={`${timelineStyles.timelineItem} ${itemClass}`}>
              <div className={`${timelineStyles.timelineDot} ${isCompleted ? timelineStyles.completed : ''} ${isFirstPending ? timelineStyles.active : ''}`}></div>
              <div className={`${timelineStyles.timelineContent} ${isCompleted ? timelineStyles.completed : ''} ${isFirstPending ? timelineStyles.active : ''}`}>
                <h3>
                  {isCompleted ? <CheckCircle size={20} color="var(--color-success)" /> : <Clock size={20} color={isFirstPending ? "var(--color-primary)" : "var(--color-text-muted)"} />}
                  Unit {unit.unitNumber}: {unit.unitTitle}
                </h3>
                <div className={timelineStyles.topics}>{unit.topics}</div>
                
                {isCompleted && unit.completionDate && (
                  <div className={timelineStyles.completionDate}>
                    <CheckCircle size={14} /> Completed on {new Date(unit.completionDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
            No units found for this subject. Please select a valid subject.
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusStatus;

