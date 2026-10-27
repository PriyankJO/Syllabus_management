import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { startQuizAttempt, submitQuiz } from '../../store/slices/quizSlice';
import api from '../../services/api';
import { Clock, AlertCircle } from 'lucide-react';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of {questionId, selectedAnswer}
  const [timeLeft, setTimeLeft] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    const initQuiz = async () => {
      try {
        const quizRes = await api.get('/quizzes/' + quizId);
        const qData = quizRes.data.data;
        setQuiz(qData);
        
        // Start Attempt
        const attemptRes = await dispatch(startQuizAttempt(quizId)).unwrap();
        setAttempt(attemptRes);

        // Calculate time left based on server start time and quiz duration
        let remaining = 0;
        const durationMins = parseFloat(qData.duration) || 0;
        if (durationMins > 0) {
          const start = new Date(attemptRes.startTime).getTime();
          const now = new Date().getTime();
          const elapsedSeconds = Math.floor((now - start) / 1000);
          
          // Safeguard against client clock being behind/ahead
          const safeElapsed = Math.max(0, elapsedSeconds); 
          const totalDurationSeconds = durationMins * 60;
          remaining = totalDurationSeconds - safeElapsed;
        }

        if (remaining <= 0 && durationMins > 0) {
          handleAutoSubmit(attemptRes._id, []);
        } else {
          setTimeLeft(remaining);
        }

      } catch (err) {
        const errorMsg = typeof err === 'string' ? err : (err?.message || 'Failed to start quiz');
        if (errorMsg.toLowerCase().includes('attempt')) {
           setError('You have reached the maximum allowed attempts (3) for this quiz. You cannot take it again.');
        } else {
           setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };
    initQuiz();

    return () => clearInterval(timerRef.current);
  }, [quizId, dispatch]);

  const answersRef = useRef(answers);
  const attemptRef = useRef(attempt);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    // Only set up the interval once
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (attemptRef.current) {
              handleAutoSubmit(attemptRef.current._id, answersRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft === null]); // only re-run if we transition from null to a number

  const handleSelectOption = (questionId, option) => {
    const existingIdx = answers.findIndex(a => a.questionId === questionId);
    if (existingIdx >= 0) {
      const newAns = [...answers];
      newAns[existingIdx].selectedAnswer = option;
      setAnswers(newAns);
    } else {
      setAnswers([...answers, { questionId, selectedAnswer: option }]);
    }
  };

  const handleAutoSubmit = async (attemptId, currentAnswers) => {
    setSubmitting(true);
    try {
      await dispatch(submitQuiz({ quizId, attemptId, answers: currentAnswers })).unwrap();
      navigate('/student/quiz-history');
    } catch (err) {
      console.warn("Auto-submit note:", err.message);
      navigate('/student/quiz-history');
    }
  };

  const handleSubmit = async () => {
    if (window.confirm("Are you sure you want to submit the quiz? You cannot change your answers after submission.")) {
      clearInterval(timerRef.current);
      setSubmitting(true);
      try {
        await dispatch(submitQuiz({ quizId, attemptId: attempt._id, answers })).unwrap();
        navigate('/student/quiz-history');
      } catch (err) {
        alert("Submission note: " + (err.message || 'Saved successfully'));
        navigate('/student/quiz-history');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div style={{ padding: '20px' }}>Initializing Quiz Environment...</div>;
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '20px' }}>
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', borderRadius: '12px', padding: '40px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '50%', marginBottom: '20px' }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>Quiz Notice</h2>
          <p style={{ color: '#b91c1c', margin: '0 0 25px 0', fontSize: '1.05rem', lineHeight: '1.5' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/student/take-test')}
              style={{ padding: '12px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              Back to Tests
            </button>
            <button 
              onClick={() => navigate('/student/quiz-history')}
              style={{ padding: '12px 20px', backgroundColor: '#4b5563', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!quiz || !attempt) return null;

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', maxWidth: '600px', margin: '40px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <AlertCircle size={48} color="#f59e0b" style={{ marginBottom: '15px' }} />
        <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-text-main)' }}>Quiz Questions Under Preparation</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '25px' }}>
          Questions for this test have not been published yet by the faculty member. Please check back shortly.
        </p>
        <button 
          onClick={() => navigate('/student/take-test')}
          style={{ padding: '10px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Back to Available Tests
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIdx] || quiz.questions[0];
  const currentAnswer = answers.find(a => a.questionId === currentQ._id)?.selectedAnswer;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>{quiz.title}</h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--color-text-muted)' }}>{quiz.subject?.name}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 'bold', color: timeLeft < 60 ? 'var(--color-danger)' : 'var(--color-text-main)', backgroundColor: '#f8fafc', padding: '10px 20px', borderRadius: '8px' }}>
          <Clock size={24} /> {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Main Question Area */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
            Question {currentQuestionIdx + 1} of {quiz.totalQuestions}
          </div>
          
          <h3 style={{ fontSize: '1.2rem', lineHeight: '1.5', marginBottom: '30px', color: 'var(--color-text-main)' }}>
            {currentQ.questionText}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(currentQ.options || []).map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D', 'E', 'F'][idx] || (idx + 1);
              const isSelected = currentAnswer === opt;
              return (
                <label 
                  key={idx} 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 18px', 
                    border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                    borderRadius: '10px', cursor: 'pointer', 
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'white',
                    boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '0.9rem',
                    backgroundColor: isSelected ? 'var(--color-primary)' : '#f1f5f9',
                    color: isSelected ? 'white' : 'var(--color-text-main)',
                    flexShrink: 0
                  }}>
                    {letter}
                  </div>
                  <input 
                    type="radio" 
                    name={`q-${currentQ._id}`} 
                    checked={isSelected} 
                    onChange={() => handleSelectOption(currentQ._id, opt)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '1.05rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)', fontWeight: isSelected ? 600 : 400, flex: 1 }}>
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
            <button 
              onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
              disabled={currentQuestionIdx === 0}
              style={{ padding: '10px 20px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentQuestionIdx === 0 ? 0.5 : 1, fontWeight: 'bold' }}
            >
              Previous
            </button>
            
            {currentQuestionIdx === quiz.totalQuestions - 1 ? (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: '10px 30px', backgroundColor: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestionIdx(p => Math.min(quiz.totalQuestions - 1, p + 1))}
                style={{ padding: '10px 30px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div style={{ width: '250px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', alignSelf: 'flex-start' }}>
          <h4 style={{ margin: '0 0 15px 0', color: 'var(--color-text-main)' }}>Navigation</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {quiz.questions.map((q, idx) => {
              const isAnswered = answers.some(a => a.questionId === q._id);
              const isCurrent = idx === currentQuestionIdx;
              
              let bg = '#f1f5f9';
              let color = 'var(--color-text-main)';
              let border = '1px solid #cbd5e1';
              
              if (isCurrent) {
                border = '2px solid var(--color-primary)';
              } else if (isAnswered) {
                bg = 'var(--color-secondary)';
                color = 'white';
                border = 'none';
              }

              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  style={{
                    width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: bg, color: color, border: border, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div style={{ marginTop: '30px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.85rem' }}>
              <div style={{ width: '15px', height: '15px', backgroundColor: 'var(--color-secondary)', borderRadius: '3px' }}></div> Answered ({answers.length})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ width: '15px', height: '15px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px' }}></div> Unanswered ({quiz.totalQuestions - answers.length})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
