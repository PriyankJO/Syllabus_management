import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUnitStatus, addUnit, fetchSyllabusStatus } from '../../store/slices/syllabusStatusSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { fetchSyllabus } from '../../store/slices/syllabusSlice';
import { fetchQuizzes } from '../../store/slices/quizSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { Link } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import { 
  Plus, Clock, CheckCircle, BookOpen, Download, ExternalLink, 
  HelpCircle, Users, Copy, Check, Send, AlertCircle, FileText 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import styles from './SyllabusCompletion.module.css';

const SyllabusCompletion = () => {
  const { user } = useSelector(state => state.auth);
  const { subjects, loading: subjLoading } = useSelector(state => state.subjects);
  const { units } = useSelector(state => state.syllabusStatus);
  const syllabusList = useSelector(state => state.syllabus?.syllabus || state.syllabus?.syllabusList) || [];
  const { quizzes } = useSelector(state => state.quiz);
  
  const dispatch = useDispatch();

  const [selectedSubject, setSelectedSubject] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ unitNumber: '', unitTitle: '', topics: '' });
  const [copiedCode, setCopiedCode] = useState(null);
  const [shareMsg, setShareMsg] = useState(null);

  useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchSyllabusStatus());
    dispatch(fetchSyllabus());
    dispatch(fetchQuizzes());
  }, [dispatch]);

  // Subject filtering: HOD sees all department subjects; Faculty sees assigned or department subjects
  const userDeptId = user?.department?._id || user?.department?.id || (typeof user?.department === 'string' ? user.department : null);
  const basePath = user?.role === 'HOD' ? '/hod' : '/faculty';
  
  let mySubjects = [];
  if (user?.role === 'HOD') {
    mySubjects = userDeptId
      ? subjects.filter(s => {
          const sDeptId = s.department?._id || s.department?.id || (typeof s.department === 'string' ? s.department : null);
          return sDeptId === userDeptId;
        })
      : subjects;
  } else if (user?.role === 'FACULTY') {
    mySubjects = subjects.filter(s => {
      const facId = s.faculty?._id || s.faculty?.id || s.faculty;
      return facId === (user._id || user.id);
    });
    if (mySubjects.length === 0 && userDeptId) {
      mySubjects = subjects.filter(s => {
        const sDeptId = s.department?._id || s.department?.id || (typeof s.department === 'string' ? s.department : null);
        return sDeptId === userDeptId;
      });
    }
  } else {
    mySubjects = subjects;
  }

  if (mySubjects.length === 0) {
    mySubjects = subjects;
  }

  // Automatically select the first subject once loaded if none is selected
  useEffect(() => {
    if (mySubjects.length > 0 && !selectedSubject) {
      setSelectedSubject(mySubjects[0]._id || mySubjects[0].id);
    }
  }, [mySubjects, selectedSubject]);

  const currentSubjectObj = subjects.find(s => (s._id || s.id) === selectedSubject);

  // Filter units for selected subject
  const subjectUnits = units.filter(u => {
    const unitSubjectId = u.subject?._id || u.subject?.id || u.subject || u.subjectId || (u.syllabus && (u.syllabus.subject?._id || u.syllabus.subject));
    return unitSubjectId === selectedSubject;
  }).sort((a, b) => a.unitNumber - b.unitNumber);

  // Find matching syllabus document
  const currentSyllabus = syllabusList.find(s => {
    const sSubjId = s.subject?._id || s.subject?.id || (typeof s.subject === 'string' ? s.subject : null);
    return sSubjId === selectedSubject;
  });

  // Find matching quizzes
  const subjectQuizzes = quizzes.filter(q => {
    const qSubjId = q.subject?._id || q.subject?.id || (typeof q.subject === 'string' ? q.subject : null);
    return qSubjId === selectedSubject;
  });

  // Calculate Progress
  const totalUnits = subjectUnits.length;
  const completedUnits = subjectUnits.filter(u => u.status === 'Completed').length;
  const progressPercentage = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  const handleStatusChange = (unit, newStatus) => {
    dispatch(updateUnitStatus({
      unitId: unit._id || unit.id,
      status: newStatus
    }));

    if (newStatus === 'Completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleAddUnit = (e) => {
    e.preventDefault();
    const unit = {
      id: `UNIT${Math.floor(Math.random() * 1000)}`,
      subject: selectedSubject,
      unitNumber: parseInt(newUnit.unitNumber) || (subjectUnits.length + 1),
      unitTitle: newUnit.unitTitle,
      topics: newUnit.topics,
      status: 'Pending',
      completionDate: null,
      createdBy: user._id || user.id
    };
    dispatch(addUnit(unit));
    setIsModalOpen(false);
    setNewUnit({ unitNumber: '', unitTitle: '', topics: '' });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareQuiz = async (quiz) => {
    navigator.clipboard.writeText(quiz.quizCode);
    try {
      await dispatch(addNotification({
        title: `Test Available: ${quiz.title}`,
        message: `Quiz Code: "${quiz.quizCode}" is active for ${quiz.subject?.name || 'your subject'}. Enter code in "Take Test" to begin.`,
        type: 'Quiz / Test',
        roleTarget: 'Student'
      })).unwrap();
      setShareMsg(`Code "${quiz.quizCode}" copied and notification sent to students!`);
    } catch {
      setShareMsg(`Code "${quiz.quizCode}" copied to clipboard!`);
    }
    setTimeout(() => setShareMsg(null), 3500);
  };

  if (subjLoading && !subjects.length) {
    return <div style={{ padding: '20px' }}>Loading Syllabus & Course Data...</div>;
  }

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '10px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>Syllabus Completion & Course Tracking</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)' }}>
          Monitor curriculum coverage, syllabus document status, and quiz assessments for your courses.
        </p>
      </div>

      {shareMsg && (
        <div style={{ padding: '10px 16px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} color="var(--color-success)" /> {shareMsg}
        </div>
      )}
      
      {/* Subject Selector & Progress Bar */}
      <div className={styles.subjectSelector} style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '25px' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>Select Course Subject:</label>
          <select 
            value={selectedSubject} 
            onChange={e => setSelectedSubject(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white', fontWeight: 600 }}
          >
            <option value="">Select a Subject</option>
            {mySubjects.map(s => (
              <option key={s._id || s.id} value={s._id || s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        {selectedSubject && (
          <div style={{ flex: 2, minWidth: '320px', backgroundColor: 'white', padding: '16px 20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>Syllabus Coverage: {completedUnits} of {totalUnits} Units Completed</span>
              <span style={{ fontWeight: 'bold', color: progressPercentage === 100 ? 'var(--color-success)' : 'var(--color-primary)' }}>{progressPercentage}%</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '10px', height: '10px' }}>
              <div style={{ 
                width: `${progressPercentage}%`, 
                backgroundColor: progressPercentage === 100 ? 'var(--color-success)' : 'var(--color-primary)', 
                height: '100%', 
                borderRadius: '10px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: COURSE SYLLABUS DOCUMENT & DETAILS */}
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '20px 24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BookOpen size={20} color="var(--color-primary)" />
              <h3 style={{ margin: 0, color: 'var(--color-text-main)' }}>
                {currentSubjectObj ? `${currentSubjectObj.name} (${currentSubjectObj.code})` : 'Subject Details'}
              </h3>
            </div>
            <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Department: <strong>{currentSubjectObj?.department?.name || 'Assigned'}</strong> • Semester: <strong>{currentSubjectObj?.semester || '-'}</strong> • Credits: <strong>{currentSubjectObj?.credits || 4}</strong> • Assigned Faculty: <strong>{currentSubjectObj?.faculty?.name || 'Unassigned'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentSyllabus ? (
              <button
                onClick={() => {
                  const url = currentSyllabus.file?.startsWith('/') ? `http://localhost:5000${currentSyllabus.file}` : currentSyllabus.file;
                  window.open(url, '_blank');
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
                  border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                <FileText size={16} /> View Uploaded Syllabus
              </button>
            ) : (
              <Link
                to={`${basePath}/syllabus`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', backgroundColor: '#fef3c7', color: '#b45309',
                  border: '1px solid #fde68a', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem'
                }}
              >
                <Plus size={16} /> Upload Syllabus Document
              </Link>
            )}
          </div>
        </div>

        {currentSyllabus ? (
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginTop: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>{currentSyllabus.title}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>{currentSyllabus.description || 'Official curriculum outline and topic details.'}</div>
          </div>
        ) : (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', fontStyle: 'italic', marginTop: '8px' }}>
            No formal syllabus PDF uploaded yet for this subject. You can add one anytime from the Syllabus section.
          </div>
        )}
      </div>

      {/* SECTION 2: UNIT COMPLETION TIMELINE */}
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '20px 24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--color-primary)" /> Syllabus Units Timeline & Coverage
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
              Mark units completed as you teach them to update student dashboards in real time.
            </p>
          </div>
          {selectedSubject && (
            <button 
              className={styles.addBtn} 
              onClick={() => {
                setNewUnit({ unitNumber: String(subjectUnits.length + 1), unitTitle: '', topics: '' });
                setIsModalOpen(true);
              }}
              style={{ margin: 0 }}
            >
              <Plus size={16} /> Add Unit
            </button>
          )}
        </div>

        <div className={styles.timeline}>
          {subjectUnits.length > 0 ? subjectUnits.map((unit, index) => {
            const isCompleted = unit.status === 'Completed';
            const isFirstPending = !isCompleted && (index === 0 || subjectUnits[index - 1].status === 'Completed');
            const itemClass = index % 2 === 0 ? styles.left : styles.right;
            
            return (
              <div key={unit._id || unit.id} className={`${styles.timelineItem} ${itemClass}`}>
                <div className={`${styles.timelineDot} ${isCompleted ? styles.completed : ''} ${isFirstPending ? styles.active : ''}`}></div>
                <div className={`${styles.timelineContent} ${isCompleted ? styles.completed : ''} ${isFirstPending ? styles.active : ''}`}>
                  <h3>
                    {isCompleted ? <CheckCircle size={20} color="var(--color-success)" /> : <Clock size={20} color={isFirstPending ? "var(--color-primary)" : "var(--color-text-muted)"} />}
                    Unit {unit.unitNumber}: {unit.unitTitle}
                  </h3>
                  <div className={styles.topics}>{unit.topics}</div>
                  
                  {isCompleted && unit.completionDate && (
                    <div className={styles.completionDate}>
                      <CheckCircle size={14} /> Completed on {new Date(unit.completionDate).toLocaleDateString()}
                    </div>
                  )}

                  <div className={styles.actions}>
                    {!isCompleted ? (
                      <button className={styles.completeBtn} onClick={() => handleStatusChange(unit, 'Completed')}>
                        Mark Completed
                      </button>
                    ) : (
                      <button className={styles.pendingBtn} onClick={() => handleStatusChange(unit, 'Pending')}>
                        Undo (Mark Pending)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 12px 0' }}>No unit milestones created yet for this subject.</p>
              <button 
                onClick={() => {
                  setNewUnit({ unitNumber: '1', unitTitle: '', topics: '' });
                  setIsModalOpen(true);
                }}
                style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + Add Unit 1
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: ASSOCIATED QUIZZES & TEST ASSESSMENTS */}
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '20px 24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={20} color="var(--color-primary)" /> Subject Quizzes & Test Assessments ({subjectQuizzes.length})
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
              Tests created for this subject. Send or share the quiz code with students so they can attend the test.
            </p>
          </div>
          <Link
            to={`${basePath}/quizzes`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
              borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem'
            }}
          >
            Manage All Quizzes
          </Link>
        </div>

        {subjectQuizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '25px', color: 'var(--color-text-muted)', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <p style={{ margin: 0 }}>No tests or quizzes currently published for this subject.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {subjectQuizzes.map(quiz => (
              <div key={quiz._id || quiz.id} style={{
                border: '1px solid var(--color-border)', borderRadius: '10px', padding: '16px',
                backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-main)' }}>{quiz.title}</h4>
                    <span style={{
                      padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                      backgroundColor: quiz.status === 'Published' ? '#dcfce7' : '#fef3c7',
                      color: quiz.status === 'Published' ? '#15803d' : '#b45309'
                    }}>
                      {quiz.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Quiz Code:</span>
                    <code style={{ padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {quiz.quizCode}
                    </code>
                    <button
                      onClick={() => handleCopyCode(quiz.quizCode)}
                      title="Copy Code"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedCode === quiz.quizCode ? 'var(--color-success)' : '#64748b' }}
                    >
                      {copiedCode === quiz.quizCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', gap: '12px', marginBottom: '15px' }}>
                    <span>{quiz.totalQuestions} Questions</span>
                    <span>•</span>
                    <span>{quiz.duration} Mins</span>
                    <span>•</span>
                    <span>{quiz.totalMarks} Marks</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleShareQuiz(quiz)}
                    style={{
                      flex: 1, padding: '7px 10px', backgroundColor: 'var(--color-primary)', color: 'white',
                      border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}
                  >
                    <Send size={12} /> Send Code
                  </button>
                  <Link
                    to={`${basePath}/quiz-results/${quiz._id || quiz.id}`}
                    style={{
                      padding: '7px 10px', backgroundColor: 'white', color: 'var(--color-text-main)',
                      border: '1px solid var(--color-border)', borderRadius: '6px', fontWeight: 600,
                      fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <Users size={12} /> Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Syllabus Unit">
        <form onSubmit={handleAddUnit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 600 }}>Unit Number</label>
            <input required type="number" min="1" value={newUnit.unitNumber} onChange={e => setNewUnit({...newUnit, unitNumber: e.target.value})} style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 600 }}>Unit Title</label>
            <input required type="text" placeholder="e.g., Object-Oriented Principles" value={newUnit.unitTitle} onChange={e => setNewUnit({...newUnit, unitTitle: e.target.value})} style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 600 }}>Topics Covered</label>
            <textarea required placeholder="List key concepts, lessons, or reading assignments..." value={newUnit.topics} onChange={e => setNewUnit({...newUnit, topics: e.target.value})} style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '6px', minHeight: '80px' }}></textarea>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Unit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SyllabusCompletion;
