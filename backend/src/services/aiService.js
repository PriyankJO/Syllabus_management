const { GoogleGenAI } = require('@google/genai');

const aiService = {
  async extractTopics(text) {
    if (!process.env.AI_API_KEY) {
      console.warn("AI API Key missing, returning mock topics.");
      return ["Introduction", "Core Concepts", "Advanced Algorithms", "Summary"];
    }

    const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
    
    const prompt = `
Analyze the following educational material and extract the main topics, chapters, or concepts.
Return the result strictly as a JSON array of strings. Do not include markdown formatting or backticks around the JSON.
Example: ["Arrays", "Linked Lists", "Trees"]

Material:
${text.substring(0, 50000)} // Limit to prevent payload issues
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const resText = response.text().trim();
      let cleaned = resText;
      if (cleaned.startsWith('\`\`\`json')) cleaned = cleaned.replace(/^\`\`\`json/, '');
      if (cleaned.startsWith('\`\`\`')) cleaned = cleaned.replace(/^\`\`\`/, '');
      if (cleaned.endsWith('\`\`\`')) cleaned = cleaned.replace(/\`\`\`$/, '');
      return JSON.parse(cleaned.trim());
    } catch (error) {
      console.warn("AI Topic Extraction Error:", error.message);
      return ["Unit 1: Overview & Fundamental Concepts", "Unit 2: Practical Applications", "Unit 3: Problem Solving", "Unit 4: Review and Assessment"];
    }
  },

  async generateQuiz(text, config) {
    const { numQuestions, difficulty, topics, marksPerQuestion } = config;

    if (!process.env.AI_API_KEY) {
      console.warn("AI API Key missing, returning mock questions.");
      const mockQuestions = [];
      const sentences = text.split(/[.?!]+/).map(s => s.trim()).filter(s => s.length > 20);
      
      for(let i = 0; i < numQuestions; i++) {
        const sentence = sentences[i % sentences.length] || `Topic: ${topics ? topics[0] : 'General Knowledge'}`;
        const words = sentence.split(' ').filter(w => w.length > 3);
        
        const opt1 = `It involves ${words.slice(0, 2).join(' ')}...`;
        const opt2 = `It excludes ${words.slice(-2).join(' ')}...`;
        const opt3 = `It refers to ${topics && topics.length > 0 ? topics[0] : 'the core subject'}`;
        const opt4 = `All of the above`;
        
        mockQuestions.push({
          questionText: `Which of the following is true regarding: "${sentence.substring(0, 60)}..."?`,
          options: [opt1, opt2, opt3, opt4],
          correctAnswer: opt1,
          explanation: `Based on the provided text context: ${sentence}`,
          marks: marksPerQuestion,
          difficulty: difficulty === 'Mixed' ? 'Medium' : difficulty,
          topic: topics && topics.length > 0 ? topics[0] : 'General'
        });
      }
      return mockQuestions;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
    
    const prompt = `
Generate a strictly formatted JSON array of ${numQuestions} multiple-choice questions based ONLY on the supplied material.
${topics && topics.length > 0 ? `Focus specifically on these topics: ${topics.join(', ')}` : ''}

Rules:
1. Do not introduce outside information.
2. Provide exactly 4 options per question.
3. Only one option should be correct.
4. Difficulty should be roughly: ${difficulty}.
5. Do not include markdown formatting or backticks around the JSON.

JSON Structure for each question:
{
  "questionText": "Question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Exact string of correct option",
  "explanation": "Brief explanation",
  "marks": ${marksPerQuestion},
  "difficulty": "${difficulty === 'Mixed' ? 'Medium' : difficulty}",
  "topic": "Relevant topic"
}

Material:
${text.substring(0, 50000)}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      const resText = response.text().trim();
      let cleaned = resText;
      if (cleaned.startsWith('\`\`\`json')) cleaned = cleaned.replace(/^\`\`\`json/, '');
      if (cleaned.startsWith('\`\`\`')) cleaned = cleaned.replace(/^\`\`\`/, '');
      if (cleaned.endsWith('\`\`\`')) cleaned = cleaned.replace(/\`\`\`$/, '');
      
      return JSON.parse(cleaned.trim());
    } catch (error) {
      console.warn("AI Quiz Generation Error, using fallback:", error.message);
      const mockQuestions = [];
      const sentences = text.split(/[.?!]+/).map(s => s.trim()).filter(s => s.length > 10);
      for (let i = 0; i < numQuestions; i++) {
        const sentence = sentences[i % sentences.length] || `Core Syllabus Topic: ${topics ? topics[0] : 'Curriculum'}`;
        const opt1 = `Option A: Standard interpretation of ${sentence.substring(0, 30)}`;
        const opt2 = `Option B: Alternative analysis of ${sentence.substring(0, 30)}`;
        const opt3 = `Option C: Methodological evaluation`;
        const opt4 = `Option D: None of the above`;
        mockQuestions.push({
          questionText: `Which of the following is correct regarding: "${sentence.substring(0, 70)}"?`,
          options: [opt1, opt2, opt3, opt4],
          correctAnswer: opt1,
          explanation: `Based on syllabus unit reading: ${sentence}`,
          marks: marksPerQuestion,
          difficulty: difficulty === 'Mixed' ? 'Medium' : difficulty,
          topic: topics && topics.length > 0 ? topics[0] : 'General'
        });
      }
      return mockQuestions;
    }
  }
};

module.exports = aiService;
