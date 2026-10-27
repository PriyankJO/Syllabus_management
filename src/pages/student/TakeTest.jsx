import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuizzes } from '../../store/slices/quizSlice';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, AlertCircle, Filter, KeyRound, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const StudentQuizzes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizzes, loading } = useSelector(state => state.quiz);
  const { user } = useSelector(state => state.auth);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Quiz code state
  const [quizCodeInput, setQuizCodeInput] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  // Handle entering quiz by code sent from faculty
  const handleAttendByCode = async (e) => {
    e?.preventDefault();
    const code = quizCodeInput.trim();
    if (!code) {
      setCodeError('Please enter a valid Quiz Code.');
      return;
    }
    setCodeError('');
    setCodeLoading(true);

    try {
      // First check in loaded quizzes
      const localMatch = quizzes.find(q => q.quizCode?.toLowerCase() === code.toLowerCase());
      if (localMatch) {
        navigate(`/student/quiz/${localMatch._id || localMatch.id}`);
        return;
      }

      // Query API for quiz with this code
      const res = await api.get(`/quizzes?quizCode=${encodeURIComponent(code)}`);
      const matchedQuiz = res.data.data?.[0];
      if (matchedQuiz) {
        navigate(`/student/quiz/${matchedQuiz._id || matchedQuiz.id}`);
      } else {
        setCodeError(`No active test found with code "${code}". Please check with your faculty.`);
      }
    } catch (err) {
      setCodeError(err.response?.data?.message || 'Failed to verify quiz code. Please try again.');
    } finally {
      setCodeLoading(false);
    }
  };

  const userDeptId = user?.department?._id || user?.department?.id || (typeof user?.department === 'string' ? user.department : null);

  const uniqueSubjects = [...new Map(quizzes.map(item => [item.subject?._id || item.subject?.id, item.subject])).values()].filter(Boolean);
  const uniqueDepartments = [...new Map(quizzes.map(item => [item.department?._id || item.department?.id, item.department])).values()].filter(Boolean);

  const filteredQuizzes = quizzes.filter(q => {
    const qDeptId = q.department?._id || q.department?.id || (typeof q.department === 'string' ? q.department : null);
    const matchDepartment = selectedDepartment ? (qDeptId === selectedDepartment) : true;
    const matchSubject = selectedSubject ? (q.subject?._id === selectedSubject || q.subject?.id === selectedSubject) : true;
    return matchSubject && matchDepartment;
  });

  if (loading) return <div style={{ padding: '20px' }}>Loading Available Quizzes...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.8rem' }}>Take Test / Examination</h2>
        <p style={{ margin: '5px 0 0 0', color: 'var(--color-text-muted)' }}>
          Enter a quiz code sent by your faculty or browse available department assessments below.
        </p>
      </div>

      {/* QUIZ CODE ENTRY BOX */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white', borderRadius: '14px', padding: '28px',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)', marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <KeyRound size={24} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>Have a Quiz Code from Faculty?</h3>
        </div>
        <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.95rem' }}>
          If your faculty provided a test code (e.g., via study materials or notification), enter it below to immediately attend the test.
        </p>

        <form onSubmit={handleAttendByCode} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', maxWidth: '650px' }}>
          <input
            type="text"
            placeholder="Enter Quiz Code (e.g. QZ-1790253095474)"
            value={quizCodeInput}
            onChange={(e) => {
              setQuizCodeInput(e.target.value);
              if (codeError) setCodeError('');
            }}
            style={{
              flex: 1, minWidth: '260px', padding: '12px 16px', borderRadius: '8px',
              border: '2px solid #334155', backgroundColor: '#1e293b', color: 'white',
              fontSize: '1rem', outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={codeLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
              cursor: codeLoading ? 'wait' : 'pointer', transition: 'all 0.2s'
            }}
          >
            {codeLoading ? 'Checking...' : 'Attend Test'} <ArrowRight size={18} />
          </button>
        </form>

        {codeError && (
          <div style={{
            marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px',
            color: '#f87171', fontSize: '0.9rem', fontWeight: 500
          }}>
            <AlertCircle size={16} /> {codeError}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--color-text-main)' }}>Available Tests</h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Quizzes published for your curriculum.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '8px 14px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <Filter size={16} color="var(--color-text-muted)" />
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontWeight: 'bold', color: 'var(--color-text-main)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(dep => (
                <option key={dep._id || dep.id} value={dep._id || dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '8px 14px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <Filter size={16} color="var(--color-text-muted)" />
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontWeight: 'bold', color: 'var(--color-text-main)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(sub => (
                <option key={sub._id || sub.id} value={sub._id || sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px' }}>
          <AlertCircle size={40} color="var(--color-text-muted)" style={{ marginBottom: '10px' }} />
          <h3>No quizzes available right now.</h3>
          {(selectedSubject || selectedDepartment) && <p>Try clearing your filters.</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredQuizzes.map(quiz => (
            <div key={quiz._id || quiz.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', color: 'var(--color-text-main)' }}>{quiz.title}</h3>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  {quiz.department?.name} • {quiz.subject?.name}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} /> {quiz.totalQuestions} Questions ({quiz.totalMarks} Marks)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} /> {quiz.duration} Minutes
                  </div>
                  {quiz.quizCode && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Code:</span>
                      <code style={{ padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {quiz.quizCode}
                      </code>
                    </div>
                  )}
                </div>
              </div>
              
              <Link 
                to={`/student/quiz/${quiz._id || quiz.id}`}
                style={{ display: 'block', textAlign: 'center', padding: '10px', backgroundColor: 'var(--color-secondary)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}
              >
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;
