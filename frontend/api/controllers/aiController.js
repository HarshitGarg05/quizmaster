const axios = require('axios');

const generateQuestions = async (req, res) => {
  try {
    const { category, topic, difficulty, numQuestions } = req.body;

    const prompt = `Generate ${numQuestions || 5} multiple choice questions for ${topic} in the ${category} category with ${difficulty || 'Medium'} difficulty level. 
        Important: Output MUST be a valid JSON object with a key 'questions' containing an array of exactly ${numQuestions || 5} question objects.
        
        Question Object Structure:
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string (must be exact match of one option)",
          "explanation": "Provide a clear, concise, and educational explanation (2-3 sentences, approx 30-50 words) why this is the correct answer. Avoid being too brief or overly verbose."
        }`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a quiz generation expert and educational tutor. You provide clear, insightful explanations and only output valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    const parsedData = JSON.parse(content);
    const questions = parsedData.questions || (Array.isArray(parsedData) ? parsedData : []);

    res.status(200).json(questions);
  } catch (err) {
    console.error('Groq Generation Error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'AI Generation failed via Groq',
      error: err.response?.data?.error?.message || err.message
    });
  }
};

module.exports = { generateQuestions };
