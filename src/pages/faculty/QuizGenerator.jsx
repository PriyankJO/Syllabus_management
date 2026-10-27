import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { analyzeMaterial, generateQuiz, addQuiz } from '../../store/slices/quizSlice';
import { BookOpen, FileText, PlayCircle, Plus, Trash2, Edit2, CheckCircle, Save, Copy, Check, Bell } from 'lucide-react';

const QuizGenerator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { departments } = useSelector(state => state.departments);
  const { subjects } = useSelector(state => state.subjects);
  
  const [step, setStep] = useState(1); // 1: Setup, 2: Analyze, 3: Review/Edit, 4: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdQuiz, setCreatedQuiz] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Setup State
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [materialText, setMaterialText] = useState('');

  // Analysis State
  const [analyzedTopics, setAnalyzedTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [extractedText, setExtractedText] = useState('');

  // Generation Config State
  const [config, setConfig] = useState({
    title: 'Generated Quiz',
    description: '',
    numQuestions: '10',
    difficulty: 'Medium',
    duration: '20',
    marksPerQuestion: '1',
    negativeMarks: '0'
  });

  // Generated Quiz State
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const filteredSubjects = subjects.filter(s => {
    const sDeptId = s.department?._id || s.department?.id || s.department;
    return sDeptId === department;
  });

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!department || !subject) return alert("Select department and subject");
    if (!materialFile && !materialText.trim()) return alert("Provide material file or text");

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (materialFile) formData.append('file', materialFile);
      if (materialText) formData.append('text', materialText);

      const res = await dispatch(analyzeMaterial(formData)).unwrap();
      setAnalyzedTopics(res.topics || []);
      setSelectedTopics(res.topics || []);
      setExtractedText(res.extractedText || '');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) return alert("Select at least one topic");
    setLoading(true);
    setError(null);
    try {
      const res = await dispatch(generateQuiz({
        text: extractedText,
        topics: selectedTopics,
        numQuestions: config.numQuestions,
        difficulty: config.difficulty,
        marksPerQuestion: config.marksPerQuestion
      })).unwrap();
      
      setQuestions(res || []);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dispatch(addQuiz({
        title: config.title,
        description: config.description,
        department,
        subject,
        topics: selectedTopics,
        difficulty: config.difficulty,
        duration: config.duration,
        marksPerQuestion: config.marksPerQuestion,
        negativeMarks: config.negativeMarks,
        questions,
        status: 'Published'
      })).unwrap();
      setCreatedQuiz(res);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Publishing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = (index, updatedQ) => {
    const newQs = [...questions];
    newQs[index] = updatedQ;
    setQuestions(newQs);
    setEditingIndex(null);
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm("Delete this question?")) {
      const newQs = questions.filter((_, i) => i !== index);
      setQuestions(newQs);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      questionText: 'New Question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'Option 1',
      explanation: '',
      marks: Number(config.marksPerQuestion) || 1,
      difficulty: config.difficulty === 'Mixed' ? 'Medium' : config.difficulty,
      topic: selectedTopics.length > 0 ? selectedTopics[0] : 'General'
    };
    setQuestions([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '5px' }}>AI Quiz Generator</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>Create intelligent assessments from your study materials.</p>

      {error && (
        <div style={{ padding: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* STEP 1: Setup & Upload */}
      {step === 1 && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Step 1: Configuration & Material</h3>
          <form onSubmit={handleAnalyze}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} required disabled={!department} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                  <option value="">Select Subject</option>
                  {filteredSubjects.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Upload Study Material (PDF, TXT)</label>
              <input type="file" accept=".pdf,.txt" onChange={e => setMaterialFile(e.target.files[0])} style={{ width: '100%', padding: '10px', border: '1px dashed var(--color-primary)', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.05)' }} />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>OR Paste Material Text</label>
              <textarea 
                value={materialText} 
                onChange={e => setMaterialText(e.target.value)} 
                rows="5"
                placeholder="Paste your syllabus or study material content here..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Analyzing...' : 'Analyze Material'} <FileText size={18} />
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: Configure & Generate */}
      {step === 2 && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Step 2: Extracted Topics & Quiz Settings</h3>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Topics for Generation</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {analyzedTopics.map((topic, idx) => (
                <label key={idx} style={{ padding: '8px 12px', backgroundColor: selectedTopics.includes(topic) ? 'rgba(59,130,246,0.1)' : '#f1f5f9', border: `1px solid ${selectedTopics.includes(topic) ? '#3b82f6' : '#cbd5e1'}`, borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="checkbox" checked={selectedTopics.includes(topic)} onChange={(e) => {
                    if (e.target.checked) setSelectedTopics([...selectedTopics, topic]);
                    else setSelectedTopics(selectedTopics.filter(t => t !== topic));
                  }} style={{ cursor: 'pointer' }}/>
                  {topic}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Number of Questions</label>
              <input type="number" value={config.numQuestions} onChange={e => setConfig({...config, numQuestions: e.target.value})} min="1" max="100" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Difficulty</label>
              <select value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Marks Per Question</label>
              <input type="number" value={config.marksPerQuestion} onChange={e => setConfig({...config, marksPerQuestion: e.target.value})} min="1" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setStep(1)} style={{ padding: '10px 20px', border: '1px solid var(--color-border)', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer' }}>Back</button>
            <button onClick={handleGenerate} disabled={loading} style={{ padding: '10px 20px', backgroundColor: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Generating with AI...' : 'Generate Questions'} <PlayCircle size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Edit */}
      {step === 3 && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Step 3: Review & Publish</h3>
            <button onClick={handlePublish} disabled={loading} style={{ padding: '10px 20px', backgroundColor: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Publishing...' : 'Publish Quiz'} <CheckCircle size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Quiz Title</label>
              <input type="text" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Duration (Minutes)</label>
              <input type="number" value={config.duration} onChange={e => setConfig({...config, duration: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0 }}>Generated Questions ({questions.length})</h4>
            <button onClick={handleAddQuestion} style={{ padding: '6px 12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={16} /> Add Question
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {questions.map((q, idx) => (
              <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '15px' }}>
                {editingIndex === idx ? (
                  <div>
                    <input type="text" value={q.questionText} onChange={e => {
                      const n = [...questions]; 
                      n[idx] = { ...n[idx] };
                      n[idx].questionText = e.target.value; 
                      setQuestions(n);
                    }} style={{ width: '100%', padding: '8px', marginBottom: '10px', fontWeight: 'bold' }} />
                    
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'center' }}>
                        <input type="radio" checked={q.correctAnswer === opt} onChange={() => {
                          const n = [...questions]; 
                          n[idx] = { ...n[idx] };
                          n[idx].correctAnswer = opt; 
                          setQuestions(n);
                        }} />
                        <input type="text" value={opt} onChange={e => {
                          const n = [...questions]; 
                          n[idx] = { ...n[idx], options: [...n[idx].options] };
                          n[idx].options[oIdx] = e.target.value; 
                          if(q.correctAnswer === opt) n[idx].correctAnswer = e.target.value;
                          setQuestions(n);
                        }} style={{ flex: 1, padding: '5px' }} />
                      </div>
                    ))}
                    <button onClick={() => setEditingIndex(null)} style={{ marginTop: '10px', padding: '6px 12px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h5 style={{ margin: '0 0 10px 0', fontSize: '1.05rem' }}>{idx + 1}. {q.questionText}</h5>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setEditingIndex(idx)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteQuestion(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ padding: '8px', backgroundColor: q.correctAnswer === opt ? 'rgba(16,185,129,0.1)' : '#f8fafc', border: `1px solid ${q.correctAnswer === opt ? '#10b981' : '#e2e8f0'}`, borderRadius: '4px' }}>
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      <strong>Topic:</strong> {q.topic} | <strong>Difficulty:</strong> {q.difficulty}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Success & Auto-Notification */}
      {step === 4 && (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <CheckCircle size={44} />
          </div>
          <h2 style={{ color: 'var(--color-text-main)', marginBottom: '8px', fontSize: '1.75rem' }}>Quiz Published Successfully!</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '25px', fontSize: '0.95rem' }}>
            The quiz has been assigned and is now live for eligible students.
          </p>

          {/* Quiz Code Display Box */}
          {createdQuiz?.quizCode && (
            <div style={{
              background: '#f8fafc', border: '2px dashed #93c5fd', borderRadius: '12px',
              padding: '20px', marginBottom: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Assigned Quiz Code
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <code style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '1px' }}>
                  {createdQuiz.quizCode}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdQuiz.quizCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2500);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', backgroundColor: copiedCode ? '#ecfdf5' : 'white',
                    color: copiedCode ? '#059669' : 'var(--color-primary)',
                    border: '1px solid', borderColor: copiedCode ? '#a7f3d0' : '#cbd5e1',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem'
                  }}
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          )}

          {/* Automatic Notification Confirmation Banner */}
          <div style={{
            backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px',
            padding: '16px 20px', marginBottom: '30px', textAlign: 'left', display: 'flex', gap: '14px', alignItems: 'flex-start'
          }}>
            <Bell size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.9rem', color: '#065f46', lineHeight: '1.5' }}>
              <strong>Automatic Notification Dispatched:</strong> This quiz code has been automatically sent to the notification panel of all students in this department's syllabus. Students can simply copy this code and paste it in <strong>"Take Test"</strong> to attend the quiz.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                setStep(1); setMaterialFile(null); setMaterialText(''); setQuestions([]); setCreatedQuiz(null);
              }} 
              style={{ padding: '10px 20px', border: '1px solid var(--color-border)', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              Create Another Quiz
            </button>
            <button 
              onClick={() => navigate(user?.role === 'HOD' ? '/hod/quizzes' : '/faculty/quizzes')} 
              style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              View Quizzes & Codes
            </button>
            <button 
              onClick={() => {
                const userRole = user?.role?.toUpperCase();
                if (userRole === 'HOD') navigate('/hod/dashboard');
                else if (userRole === 'ADMIN') navigate('/admin/dashboard');
                else navigate('/faculty/dashboard');
              }} 
              style={{ padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
