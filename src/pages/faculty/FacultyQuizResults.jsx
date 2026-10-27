import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';

const FacultyQuizResults = () => {
  const { quizId } = useParams();
  const { user } = useSelector(state => state.auth);
  const basePath = user?.role === 'HOD' ? '/hod' : '/faculty';
  const [attempts, setAttempts] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizRes = await api.get('/quizzes/' + quizId);
        setQuiz(quizRes.data.data);
        
        const attemptsRes = await api.get('/quizzes/attempts?quizId=' + quizId);
        setAttempts(attemptsRes.data.data);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const columns = [
    { header: 'Student Name', accessor: 'student', render: (row) => row.student?.name },
    { header: 'Roll/Code', accessor: 'studentCode', render: (row) => row.student?.userCode },
    { header: 'Status', accessor: 'status', render: (row) => (
      <span style={{ fontWeight: 'bold', color: row.status === 'Completed' ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
        {row.status}
      </span>
    )},
    { header: 'Score', accessor: 'score', render: (row) => row.status === 'Completed' ? `${row.marksObtained} / ${row.totalMarks}` : '--' },
    { header: 'Percentage', accessor: 'percentage', render: (row) => (
      <span style={{ fontWeight: 'bold', color: row.status === 'Completed' ? (row.percentage >= 50 ? 'var(--color-success)' : 'var(--color-danger)') : 'inherit' }}>
        {row.status === 'Completed' ? `${Number(row.percentage).toFixed(2)}%` : '--'}
      </span>
    )},
    { header: 'Time Taken', accessor: 'timeTaken', render: (row) => row.status === 'Completed' ? `${Math.floor(row.timeTakenSeconds / 60)}m ${row.timeTakenSeconds % 60}s` : '--' },
    { header: 'Submitted', accessor: 'submittedAt', render: (row) => row.status === 'Completed' ? new Date(row.submittedAt).toLocaleString() : '--' },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setSelectedAttempt(row)}
          disabled={row.status !== 'Completed' && row.status !== 'Auto-Submitted'}
          style={{
            padding: '4px 8px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
          }}
        >
          View Answers
        </button>
      )
    }
  ];

  if (loading) return <div style={{ padding: '20px' }}>Loading Results...</div>;
  if (!quiz) return <div style={{ padding: '20px' }}>Quiz not found.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to={`${basePath}/quizzes`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '10px' }}>
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>
        <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Quiz Results: {quiz.title}</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{quiz.subject?.name} | {attempts.length} Submissions | Quiz Code: <strong>{quiz.quizCode}</strong></p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '20px' }}>
        <DataTable columns={columns} data={attempts} itemsPerPage={20} />
      </div>

      {/* Answer Sheet Modal */}
      {selectedAttempt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '750px',
            maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-text-main)' }}>Student Submission: {selectedAttempt.student?.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Roll: {selectedAttempt.student?.userCode} | Score: {selectedAttempt.marksObtained}/{selectedAttempt.totalMarks} ({Number(selectedAttempt.percentage).toFixed(1)}%)</span>
              </div>
              <button onClick={() => setSelectedAttempt(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {(selectedAttempt.answers || []).map((ans, idx) => {
                const questionObj = (quiz.questions || []).find(q => q._id?.toString() === ans.questionId?.toString());
                const questionText = questionObj?.questionText || `Question ${idx + 1}`;
                const options = questionObj?.options || [];

                return (
                  <div key={idx} style={{
                    padding: '12px', borderRadius: '8px', border: `1px solid ${ans.isCorrect ? '#bbf7d0' : '#fecaca'}`,
                    backgroundColor: ans.isCorrect ? '#f0fdf4' : '#fef2f2'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.95rem' }}>
                      {idx + 1}. {questionText}
                    </div>
                    {options.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', marginBottom: '8px' }}>
                        {options.map((opt, oIdx) => (
                          <div key={oIdx} style={{
                            padding: '6px 10px', borderRadius: '4px', fontSize: '0.85rem',
                            backgroundColor: opt === ans.correctAnswer ? '#dcfce7' : (opt === ans.selectedAnswer ? '#fee2e2' : '#ffffff'),
                            border: `1px solid ${opt === ans.correctAnswer ? '#86efac' : (opt === ans.selectedAnswer ? '#fca5a5' : '#e2e8f0')}`,
                            fontWeight: (opt === ans.correctAnswer || opt === ans.selectedAnswer) ? 600 : 400
                          }}>
                            {['A','B','C','D'][oIdx] || oIdx + 1}. {opt}
                            {opt === ans.selectedAnswer && <span style={{ marginLeft: '6px', color: ans.isCorrect ? '#166534' : '#991b1b', fontWeight: 'bold' }}>[Student's Choice]</span>}
                            {opt === ans.correctAnswer && <span style={{ marginLeft: '6px', color: '#166534', fontWeight: 'bold' }}>[Correct]</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Marks: {ans.marksObtained} | Status: <strong>{ans.isCorrect ? 'Correct' : 'Incorrect'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedAttempt(null)}
              style={{ marginTop: '20px', width: '100%', padding: '10px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyQuizResults;
