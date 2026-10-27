const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/student/TakeTest.jsx',
  'src/pages/student/QuizHistory.jsx',
  'src/pages/student/QuizAttempt.jsx',
  'src/pages/faculty/FacultyQuizResults.jsx',
  'src/pages/faculty/QuizGenerator.jsx',
  'src/pages/faculty/FacultyQuizzes.jsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace \` with `
    content = content.replace(/\\`/g, '`');
    fs.writeFileSync(filePath, content);
    console.log('Fixed', file);
  }
});
