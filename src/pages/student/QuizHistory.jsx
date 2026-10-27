import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Eye, ClipboardList, CheckCircle, XCircle, AlertCircle, RotateCcw, Check, X } from 'lucide-react';
import { fetchQuizAttempts } from '../../store/slices/quizSlice';

const QuizHistory = () => {
  const { quizHistory } = useSelector(state => state.quiz);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    dispatch(fetchQuizAttempts());
  }, [dispatch]);

  const tableData = (quizHistory || []).map(attempt => {
    const isCompleted = attempt.status === 'Completed' || attempt.status === 'Auto-Submitted';
    const rawPercentage = attempt.percentage || 0;
    const percentage = Number(rawPercentage).toFixed(2);
    
    // Safely parse date
    let formattedDate = '--';
    if (attempt.submittedAt || attempt.attemptDate) {
      formattedDate = new Date(attempt.submittedAt || attempt.attemptDate).toLocaleDateString();
    } else if (attempt.startTime) {
      formattedDate = new Date(attempt.startTime).toLocaleDateString();
    }

    return {
      _id: attempt._id,
      testId: attempt.quiz?.title || attempt._id.substring(0, 8),
      subject: attempt.quiz?.subject?.name || 'Unknown Subject',
      date: formattedDate,
      score: isCompleted ? attempt.marksObtained : '--',
      rawScore: attempt.marksObtained ?? 0,
      totalMarks: attempt.totalMarks,
      percentage: isCompleted ? percentage : '--',
      status: isCompleted ? (percentage >= 50 ? 'Passed' : 'Failed') : attempt.status,
      rawAttempt: attempt // keep reference for modal
    };
  });

  const columns = [
    { header: 'Test ID / Title', accessor: 'testId' },
    { header: 'Subject', accessor: 'subject', render: (row) => row.subject?.name || row.subject },
    { header: 'Date', accessor: 'date' },
    { header: 'Score', render: (row) => row.score === '--' ? '--' : `${row.score} / ${row.totalMarks}` },
    { header: 'Percentage', render: (row) => (
      <span style={{ 
        fontWeight: 600, 
        color: row.percentage === '--' ? 'var(--color-text-muted)' : (row.percentage >= 50 ? 'var(--color-success)' : 'var(--color-danger)')
      }}>
        {row.percentage === '--' ? '--' : `${row.percentage}%`}
      </span>
    )},
    { 
      header: 'Status', 
      render: (row) => (
        <span style={{ 
          padding: '4px 10px', 
          backgroundColor: row.status === 'Passed' ? 'var(--color-success-bg)' : (row.status === 'Failed' ? 'rgba(239, 68, 68, 0.1)' : '#f1f5f9'), 
          color: row.status === 'Passed' ? 'var(--color-success-text)' : (row.status === 'Failed' ? 'var(--color-danger)' : 'var(--color-text-muted)'), 
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => {
        const isCompleted = row.status !== 'In Progress';
        const scoredBelow7 = isCompleted && typeof row.rawScore === 'number' && row.rawScore < 7;
        const quizId = row.rawAttempt?.quiz?._id || row.rawAttempt?.quiz?.id || row.rawAttempt?.quiz;

        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => setSelectedAttempt(row.rawAttempt)}
              disabled={row.status === 'In Progress'}
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: row.status === 'In Progress' ? '#f1f5f9' : 'var(--color-primary-light)', 
                color: row.status === 'In Progress' ? 'var(--color-text-muted)' : 'var(--color-primary)', 
                border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                cursor: row.status === 'In Progress' ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600
            }}>
              <Eye size={14} /> Review
            </button>

            {scoredBelow7 && quizId && (
              <button
                onClick={() => navigate(`/student/quiz/${quizId}`)}
                title="Score is below 7 marks. Click to repeat test."
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a',
                  padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700
                }}
              >
                <RotateCcw size={14} /> Repeat Test
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ animation: 'fadeUp 0.5s ease-out forwards', maxWidth: '1100px', margin: '0 auto', padding: '10px' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardList color="var(--color-primary)" /> Quiz History & Test Reviews
        </h1>
        <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-text-muted)' }}>
          Review your past test performance, inspect detailed question answers, or retake low scoring tests.
        </p>
      </div>
      
      <DataTable columns={columns} data={tableData} />

      <Modal isOpen={!!selectedAttempt} onClose={() => setSelectedAttempt(null)} title="Quiz Score & Answer Review">
        {selectedAttempt && (() => {
          const quiz = selectedAttempt.quiz || {};
          const quizQuestions = quiz.questions || [];
          const answers = selectedAttempt.answers || [];
          const isBelow7 = (selectedAttempt.marksObtained ?? 0) < 7;
          const quizId = quiz._id || quiz.id || selectedAttempt.quiz;

          return (
            <div style={{ padding: '5px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: 'var(--color-text-main)' }}>{quiz.title || 'Quiz Review'}</h3>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{quiz.subject?.name || 'Course Subject'}</p>
                </div>
                {isBelow7 && quizId && (
                  <button
                    onClick={() => {
                      setSelectedAttempt(null);
                      navigate(`/student/quiz/${quizId}`);
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={16} /> Repeat Test (Low Score)
                  </button>
                )}
              </div>

              {/* Low score warning banner */}
              {isBelow7 && (
                <div style={{
                  padding: '12px 16px', backgroundColor: '#fef3c7', border: '1px solid #fde68a',
                  borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <AlertCircle size={20} color="#b45309" />
                  <div style={{ color: '#92400e', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    <strong>Score Below 7 Marks Requirement:</strong> You scored {selectedAttempt.marksObtained} marks. The system offers an option to repeat this test to achieve higher proficiency.
                  </div>
                </div>
              )}
              
              {/* Score summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '25px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {selectedAttempt.marksObtained} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>/ {selectedAttempt.totalMarks}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Score</div>
                </div>
                <div style={{ backgroundColor: selectedAttempt.percentage >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: selectedAttempt.percentage >= 50 ? '#10b981' : '#ef4444' }}>
                    {Number(selectedAttempt.percentage || 0).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: selectedAttempt.percentage >= 50 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                    {selectedAttempt.percentage >= 50 ? 'Passed' : 'Failed'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <CheckCircle size={18} /> {selectedAttempt.correctAnswers || 0}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Correct</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <XCircle size={18} /> {selectedAttempt.wrongAnswers || 0}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Incorrect</span>
                </div>
              </div>

              {/* DETAILED QUESTION & ANSWER REVIEW */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Question-by-Question Review ({answers.length || quizQuestions.length} Questions)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(answers.length > 0 ? answers : quizQuestions).map((item, idx) => {
                    // Item can be an answer record or quiz question
                    const questionObj = quizQuestions.find(q => q._id?.toString() === (item.questionId?.toString() || item._id?.toString())) || item;
                    const questionText = questionObj.questionText || `Question ${idx + 1}`;
                    const options = questionObj.options || ['Option A', 'Option B', 'Option C', 'Option D'];
                    const selected = item.selectedAnswer;
                    const correct = item.correctAnswer || questionObj.correctAnswer;
                    const isCorrect = item.isCorrect ?? (selected && selected === correct);

                    return (
                      <div key={idx} style={{
                        border: `1px solid ${isCorrect ? '#bbf7d0' : selected ? '#fecaca' : '#e2e8f0'}`,
                        borderRadius: '10px', padding: '16px', backgroundColor: isCorrect ? '#f0fdf4' : selected ? '#fef2f2' : '#f8fafc'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                            {idx + 1}. {questionText}
                          </span>
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                            backgroundColor: isCorrect ? '#dcfce7' : selected ? '#fee2e2' : '#e2e8f0',
                            color: isCorrect ? '#15803d' : selected ? '#b91c1c' : '#64748b',
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}>
                            {isCorrect ? <Check size={12} /> : selected ? <X size={12} /> : null}
                            {isCorrect ? 'Correct' : selected ? 'Incorrect' : 'Unanswered'}
                          </span>
                        </div>

                        {/* Options List */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '10px' }}>
                          {options.map((opt, oIdx) => {
                            const letter = ['A', 'B', 'C', 'D'][oIdx] || (oIdx + 1);
                            const isUserPick = selected === opt;
                            const isCorrectAnswer = correct === opt;

                            let optBg = '#ffffff';
                            let optBorder = '#e2e8f0';
                            let optColor = 'var(--color-text-main)';

                            if (isCorrectAnswer) {
                              optBg = '#dcfce7';
                              optBorder = '#86efac';
                              optColor = '#166534';
                            } else if (isUserPick && !isCorrectAnswer) {
                              optBg = '#fee2e2';
                              optBorder = '#fca5a5';
                              optColor = '#991b1b';
                            }

                            return (
                              <div key={oIdx} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '8px 12px', borderRadius: '6px', backgroundColor: optBg,
                                border: `1px solid ${optBorder}`, fontSize: '0.9rem', color: optColor
                              }}>
                                <span style={{
                                  width: '22px', height: '22px', borderRadius: '50%',
                                  backgroundColor: isCorrectAnswer ? '#22c55e' : (isUserPick ? '#ef4444' : '#f1f5f9'),
                                  color: (isCorrectAnswer || isUserPick) ? 'white' : '#64748b',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0
                                }}>
                                  {letter}
                                </span>
                                <span style={{ flex: 1, fontWeight: (isCorrectAnswer || isUserPick) ? 600 : 400 }}>{opt}</span>
                                {isUserPick && (
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isCorrectAnswer ? '#15803d' : '#b91c1c' }}>
                                    (Your Answer)
                                  </span>
                                )}
                                {isCorrectAnswer && (
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#15803d', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <Check size={12} /> Correct Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {questionObj.explanation && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
                            <strong>Explanation:</strong> {questionObj.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                {isBelow7 && quizId && (
                  <button
                    onClick={() => {
                      setSelectedAttempt(null);
                      navigate(`/student/quiz/${quizId}`);
                    }}
                    style={{
                      flex: 1, padding: '12px', backgroundColor: '#f59e0b', color: 'white',
                      border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <RotateCcw size={16} /> Repeat Test Now
                  </button>
                )}
                <button
                  onClick={() => setSelectedAttempt(null)}
                  style={{
                    flex: 1, padding: '12px', backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)', border: '1px solid var(--color-border)',
                    borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default QuizHistory;
