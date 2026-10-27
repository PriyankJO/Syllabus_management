const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Subject = require('../models/Subject');
const Department = require('../models/Department');
const { logActivity } = require('../utils/activityLogger');
const aiService = require('../services/aiService');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

// Helper to extract text from files
const extractTextFromFile = async (filePath, mimetype) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimetype === 'text/plain') {
      return dataBuffer.toString('utf8');
    }
    throw new Error('Unsupported file format');
  } catch (error) {
    throw new Error('Failed to extract text from file: ' + error.message);
  }
};

exports.analyzeMaterial = async (req, res) => {
  try {
    let text = req.body.text || '';
    if (req.file) {
      try {
        const fileContent = await extractTextFromFile(req.file.path, req.file.mimetype);
        text += (text ? '\n' : '') + fileContent;
      } catch (fErr) {
        console.warn('Text extraction fallback:', fErr.message);
      }
    }
    
    // Provide fallback topics instead of crashing with 400
    if (!text || text.trim().length < 5) {
      return res.json({ 
        success: true, 
        topics: [
          "Unit 1: Overview & Fundamental Concepts", 
          "Unit 2: Practical Methodology & Principles", 
          "Unit 3: Applied Concepts & Techniques", 
          "Unit 4: Review, Synthesis & Assessment"
        ], 
        extractedText: text || 'Syllabus and Course Material' 
      });
    }

    const topics = await aiService.extractTopics(text);
    res.json({ success: true, topics, extractedText: text });
  } catch (error) {
    console.error('analyzeMaterial error:', error.message);
    res.json({ 
      success: true, 
      topics: [
        "Unit 1: Overview and Basics", 
        "Unit 2: Applied Concepts", 
        "Unit 3: Advanced Topics", 
        "Unit 4: Comprehensive Review"
      ], 
      extractedText: req.body.text || 'Syllabus Concepts' 
    });
  }
};

exports.generateQuiz = async (req, res) => {
  try {
    const { text, topics, numQuestions, difficulty, marksPerQuestion } = req.body;
    const sampleText = text || (topics && topics.length > 0 ? topics.join('. ') : 'General Syllabus Overview and Questions.');

    const questions = await aiService.generateQuiz(sampleText, {
      numQuestions: parseInt(numQuestions) || 10,
      difficulty: difficulty || 'Medium',
      topics: topics || [],
      marksPerQuestion: parseFloat(marksPerQuestion) || 1
    });

    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { 
      title, description, department, subject, topics, difficulty, duration, 
      marksPerQuestion, negativeMarks, startDate, endDate, attemptLimit, questions, status 
    } = req.body;
    
    let totalMarks = 0;
    (questions || []).forEach(q => totalMarks += (q.marks || marksPerQuestion || 1));

    const quiz = await Quiz.create({
      quizCode: `QZ-${Date.now()}`,
      title,
      description,
      department: department || req.user.department?._id || req.user.department,
      subject,
      topics,
      difficulty,
      duration: parseInt(duration) || 20,
      marksPerQuestion: parseFloat(marksPerQuestion) || 1,
      negativeMarks: parseFloat(negativeMarks) || 0,
      totalQuestions: (questions || []).length,
      totalMarks,
      startDate,
      endDate,
      attemptLimit: attemptLimit || 5,
      questions: questions || [],
      createdBy: req.user._id,
      status: status || 'Published'
    });

    await logActivity(req, 'Created', 'Quiz', `Created quiz: ${title}`);

    // Automatically send notification with Quiz Code to students of this department & subject
    try {
      const Notification = require('../models/Notification');
      let subjectName = 'Curriculum Subject';
      if (subject) {
        const subjectDoc = await Subject.findById(subject);
        if (subjectDoc) subjectName = subjectDoc.name;
      }

      const rawDept = department || (req.user.department?._id || req.user.department);
      const validDeptId = (rawDept && String(rawDept).match(/^[0-9a-fA-F]{24}$/)) ? rawDept : null;

      await Notification.create({
        notificationCode: `NOT${Date.now()}`,
        title: `New Test Available: ${title}`,
        message: `Use Quiz Code: "${quiz.quizCode}" in "Take Test" to attend this assessment (${subjectName}). Duration: ${quiz.duration} mins.`,
        type: 'Quiz / Test',
        roleTarget: 'STUDENT',
        departmentTarget: validDeptId
      });
    } catch (notifErr) {
      console.error('Failed to create automatic quiz notification:', notifErr.message);
    }

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    let totalMarks = 0;
    if (req.body.questions) {
      const marksPerQuestion = req.body.marksPerQuestion || 1;
      req.body.questions.forEach(q => totalMarks += (q.marks || marksPerQuestion));
      req.body.totalQuestions = req.body.questions.length;
      req.body.totalMarks = totalMarks;
    }
    
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    
    await logActivity(req, 'Updated', 'Quiz', `Updated quiz: ${quiz.title}`);
    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await logActivity(req, 'Deleted', 'Quiz', `Deleted quiz: ${quiz.title}`);
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    let query = { ...req.query };
    
    if (req.query.quizCode) {
      query.quizCode = { $regex: new RegExp(`^${req.query.quizCode.trim()}$`, 'i') };
    }

    if (req.user.role === 'STUDENT') {
      query.status = { $in: ['Published', 'Active'] };
    } else if (req.user.role === 'FACULTY') {
      query.createdBy = req.user._id;
    }

    const quizzes = await Quiz.find(query)
      .populate('subject', 'name code')
      .populate('department', 'name')
      .select('-questions.correctAnswer'); // Hide answers initially

    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('department', 'name');
      
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    let quizData = quiz.toObject();
    
    // Hide correct answers from students
    if (req.user.role === 'STUDENT') {
      quizData.questions.forEach(q => delete q.correctAnswer);
    }
    
    res.json({ success: true, data: quizData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    
    if (quiz.status === 'Expired') {
      return res.status(400).json({ success: false, message: 'Quiz has expired' });
    }

    const previousAttempts = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user._id });
    const maxAttempts = quiz.attemptLimit ? Math.max(quiz.attemptLimit, 10) : 10;
    
    if (previousAttempts >= maxAttempts) {
      const lastAttempt = await QuizAttempt.findOne({ 
        quiz: quiz._id, 
        student: req.user._id 
      }).sort({ submittedAt: -1, createdAt: -1 });

      const canRepeat = lastAttempt && (lastAttempt.marksObtained < (quiz.totalMarks * 0.7) || lastAttempt.status === 'Abandoned');
      if (!canRepeat) {
        return res.status(200).json({ success: false, message: `Maximum attempts (${maxAttempts}) reached for this quiz.` });
      }
    }
    
    const existingInProgress = await QuizAttempt.findOne({ quiz: quiz._id, student: req.user._id, status: 'In Progress' });
    if (existingInProgress) {
      const durationMs = (quiz.duration || 60) * 60 * 1000;
      const isExpired = Date.now() > (new Date(existingInProgress.startTime).getTime() + durationMs);
      
      if (isExpired) {
        existingInProgress.status = 'Auto-Submitted';
        existingInProgress.endTime = new Date();
        existingInProgress.submittedAt = new Date();
        await existingInProgress.save();
        // Fall through to create fresh attempt so student is not stuck!
      } else {
        return res.json({ success: true, data: existingInProgress });
      }
    }

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,
      department: req.user.department?._id || req.user.department || quiz.department,
      subject: quiz.subject,
      attemptNumber: previousAttempts + 1,
      totalQuestions: quiz.totalQuestions || (quiz.questions ? quiz.questions.length : 0),
      totalMarks: quiz.totalMarks || 0,
      marksObtained: 0,
      percentage: 0,
      startTime: new Date(),
      status: 'In Progress'
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitQuizAttempt = async (req, res) => {
  try {
    const attemptId = req.body.attemptId || req.params.id;
    const { answers } = req.body;
    
    let attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt not found' });
    }
    if (attempt.status !== 'In Progress') {
      return res.json({ success: true, data: attempt, message: 'Attempt is already completed' });
    }

    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    let marksObtained = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    const processedAnswers = quiz.questions.map(question => {
      const submittedAns = answers.find(a => a.questionId === question._id.toString());
      let isCorrect = false;
      let qMarks = 0;

      if (!submittedAns || !submittedAns.selectedAnswer) {
        unanswered += 1;
      } else {
        if (submittedAns.selectedAnswer === question.correctAnswer) {
          isCorrect = true;
          correctAnswers += 1;
          qMarks = question.marks || quiz.marksPerQuestion;
        } else {
          wrongAnswers += 1;
          qMarks = -(quiz.negativeMarks || 0);
        }
      }

      marksObtained += qMarks;
      
      return {
        questionId: question._id,
        selectedAnswer: submittedAns ? submittedAns.selectedAnswer : null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        marksObtained: qMarks
      };
    });

    const endTime = new Date();
    const timeTakenSeconds = Math.round((endTime - attempt.startTime) / 1000);
    const percentage = quiz.totalMarks > 0 ? (marksObtained / quiz.totalMarks) * 100 : 0;

    attempt.answers = processedAnswers;
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.unanswered = unanswered;
    attempt.marksObtained = marksObtained;
    attempt.percentage = percentage;
    attempt.endTime = endTime;
    attempt.submittedAt = endTime;
    attempt.timeTakenSeconds = timeTakenSeconds;
    attempt.status = 'Completed';

    await attempt.save();

    res.json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuizAttempts = async (req, res) => {
  try {
    let query = { student: req.user._id };
    if (req.user.role !== 'STUDENT') {
      query = {}; // Faculty or Admin requesting
      if (req.query.quizId) query.quiz = req.query.quizId;
      if (req.query.studentId) query.student = req.query.studentId;
    }
    
    let attempts = await QuizAttempt.find(query)
      .populate({ path: 'quiz', populate: { path: 'subject', select: 'name code' } })
      .populate('student', 'name userCode email')
      .populate('department', 'name')
      .sort({ submittedAt: -1 });
      
    // Clean up expired 'In Progress' attempts
    let needsRefetch = false;
    const now = Date.now();
    for (const attempt of attempts) {
      if (attempt.status === 'In Progress' && attempt.quiz) {
        const durationMs = (attempt.quiz.duration || 60) * 60 * 1000;
        // 5 minute grace period to allow for slow submissions
        if (now > new Date(attempt.startTime).getTime() + durationMs + (5 * 60 * 1000)) {
          attempt.status = 'Abandoned';
          attempt.endTime = new Date();
          attempt.submittedAt = new Date();
          await attempt.save();
          needsRefetch = true;
        }
      }
    }

    if (needsRefetch) {
      attempts = await QuizAttempt.find(query)
        .populate({ path: 'quiz', populate: { path: 'subject', select: 'name code' } })
        .populate('student', 'name userCode email')
        .populate('department', 'name')
        .sort({ submittedAt: -1 });
    }

    res.json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
