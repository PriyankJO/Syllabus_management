import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuizzes, deleteQuiz } from '../../store/slices/quizSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, FileText, Trash2, Filter, Copy, Check, Send, Share2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';

const FacultyQuizzes = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { quizzes, loading } = useSelector(state => state.quiz);
  const basePath = user?.role === 'HOD' ? '/hod' : '/faculty';
  const [selectedSubject, setSelectedSubject] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(null);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this quiz? All related student attempts will also be removed.")) {
      dispatch(deleteQuiz(id));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSendCodeToStudents = async (quiz) => {
    const code = quiz.quizCode;
    navigator.clipboard.writeText(code);
    try {
      const targetDept = quiz.department?._id || quiz.department || user?.department?._id || user?.department;
      await dispatch(addNotification({
        title: `Test Available: ${quiz.title}`,
        message: `Use Quiz Code: "${code}" in Take Test to attend this assessment (${quiz.subject?.name || 'Subject'}). Duration: ${quiz.duration} mins.`,
        type: 'Quiz / Test',
        roleTarget: 'STUDENT',
        departmentTarget: targetDept
      })).unwrap();
      setShareSuccess(`Quiz code "${code}" copied and notification sent to students!`);
    } catch (err) {
      setShareSuccess(`Quiz code "${code}" copied! (Note: ${err.message || 'code ready to share'})`);
    }
    setTimeout(() => setShareSuccess(null), 4000);
  };

  const uniqueSubjects = [...new Map(quizzes.filter(q => q.subject).map(item => [item.subject?._id || item.subject?.id || item.subject, item.subject])).values()].filter(Boolean);
  const filteredQuizzes = quizzes.filter(q => selectedSubject ? (q.subject?._id === selectedSubject || q.subject?.id === selectedSubject) : true);

  const columns = [
    { header: 'Title', accessor: 'title' },
    { 
      header: 'Quiz Code', 
      accessor: 'quizCode',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <code style={{
            padding: '4px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1',
            borderRadius: '4px', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.85rem'
          }}>
            {row.quizCode || 'N/A'}
          </code>
          {row.quizCode && (
            <button
              onClick={() => handleCopyCode(row.quizCode)}
              title="Copy Quiz Code"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: copiedCode === row.quizCode ? 'var(--color-success)' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', padding: '2px'
              }}
            >
              {copiedCode === row.quizCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>
          )}
        </div>
      )
    },
    { header: 'Subject', accessor: 'subject', render: (row) => row.subject?.name },
    { header: 'Questions', accessor: 'totalQuestions' },
    { header: 'Duration', accessor: 'duration', render: (row) => `${row.duration} mins` },
    { header: 'Status', accessor: 'status', render: (row) => (
      <span style={{ 
        padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
        backgroundColor: row.status === 'Published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        color: row.status === 'Published' ? 'var(--color-success)' : 'var(--color-warning)'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Actions', render: (row) => (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={() => handleSendCodeToStudents(row)}
          title="Send Quiz Code to Students"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)',
            border: 'none', padding: '4px 8px', borderRadius: '4px',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <Send size={13} /> Send Code
        </button>
        <Link to={`${basePath}/quiz-results/${row._id || row.id}`} style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
          <Users size={15} /> Results
        </Link>
        <button onClick={() => handleDelete(row._id || row.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }} title="Delete Quiz">
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  if (loading) return <div style={{ padding: '20px' }}>Loading Quizzes...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>My Quizzes</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Manage quizzes and view student results</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <Filter size={18} color="var(--color-text-muted)" />
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontWeight: 'bold', color: 'var(--color-text-main)', cursor: 'pointer' }}
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map((sub, idx) => {
                const subId = sub?._id || sub?.id || (typeof sub === 'string' ? sub : `sub-${idx}`);
                const subName = sub?.name || (typeof sub === 'string' ? sub : `Subject ${idx + 1}`);
                return (
                  <option key={subId} value={subId}>{subName}</option>
                );
              })}
            </select>
          </div>
          <Link to={`${basePath}/quiz-generator`} style={{ padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
            + Create New Quiz
          </Link>
        </div>
      </div>

      {shareSuccess && (
        <div style={{
          padding: '12px 18px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)',
          borderRadius: '8px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Check size={18} color="var(--color-success)" /> {shareSuccess}
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '20px' }}>
        <DataTable columns={columns} data={filteredQuizzes} itemsPerPage={10} />
      </div>
    </div>
  );
};

export default FacultyQuizzes;
