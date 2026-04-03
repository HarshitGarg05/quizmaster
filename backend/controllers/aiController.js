const axios = require('axios');

const generateQuestions = async (req, res) => {
  const { category, topic, difficulty, numQuestions } = req.body;
  const keys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_FALLBACK];

  const prompt = `Generate ${numQuestions || 5} multiple choice questions for ${topic} in the ${category} category with ${difficulty || 'Medium'} difficulty level. 
      Important: Output MUST be a valid JSON object with a key 'questions' containing an array of exactly ${numQuestions || 5} question objects.
      
      Question Object Structure:
      {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": "string (must be exact match of one option)",
        "explanation": "Provide a clear, concise, and educational explanation (2-3 sentences, approx 30-50 words) why this is the correct answer. Avoid being too brief or overly verbose."
      }`;

  const tryRequest = async (keyIndex) => {
    if (keyIndex >= keys.length) throw new Error('All Neural Uplink keys exhausted. Usage limit reached for all available protocols.');

    try {
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
          'Authorization': `Bearer ${keys[keyIndex]}`,
          'Content-Type': 'application/json'
        }
      });

      const parsedData = JSON.parse(response.data.choices[0].message.content);
      return parsedData.questions || (Array.isArray(parsedData) ? parsedData : []);
    } catch (err) {
      // If it's a rate limit error (429) AND we have more keys, try the next one
      if (err.response?.status === 429 && keyIndex + 1 < keys.length) {
        console.warn(`Protocol ${keyIndex + 1} exhausted. Synchronizing with Fallback Neural Uplink...`);
        return tryRequest(keyIndex + 1);
      }
      throw err;
    }
  };

  try {
    const questions = await tryRequest(0);
    res.status(200).json(questions);
  } catch (err) {
    console.error('Neural Generation Error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'AI Generation failed across all neural protocols',
      error: err.response?.data?.error?.message || err.message
    });
  }
};

module.exports = { generateQuestions };
