const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGeminiJson(systemInstruction, prompt) {
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-3.6-flash', 
        systemInstruction,
        generationConfig: { responseMimeType: 'application/json' },
    });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

module.exports = { askGeminiJson };