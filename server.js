const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/check-symptoms', async (req, res) => {
    console.log('--- Start Symptom Analysis ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Payload:', JSON.stringify(req.body, null, 2));

    try {
        const { description, symptoms, duration, severity } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is missing from environment variables');
        }

        // Try gemini-3-flash-preview as confirmed by ListModels
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
            You are a simple health assistant. Explain symptoms in very easy language.
            
            STRICT RULES:
            - Maximum 80–100 words total.
            - Use very simple words. No medical jargon.
            - Use short sentences. No long paragraphs.
            - No medical disclaimer. No medical lectures.

            Symptom Details:
            - Symptoms: ${(symptoms && symptoms.length > 0) ? symptoms.join(', ') : "None selected"}
            - Duration: ${duration || "Not specified"}
            - Severity: ${severity || "5"}/10

            USE THIS EXACT STRUCTURE:

            ### Possible Issue
            One short sentence explaining the likely issue.

            ### What This Means
            One short sentence explaining what might be happening.

            ### What You Can Do
            - 3–4 short bullet points of simple home care.

            ### See a Doctor If
            - 2–3 warning signs.
        `;

        console.log('Calling Gemini API...');
        const result = await model.generateContent(prompt);
        console.log('API call completed. Waiting for response...');
        const response = await result.response;
        const text = response.text();
        console.log('AI response generated successfully. Length:', text.length);

        res.json({ analysis: text });
    } catch (error) {
        console.error('--- ERROR IN SYMPTOM CHECK ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);
        
        res.status(500).json({ 
            error: 'Failed to analyze symptoms.', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        console.log('--- End Symptom Analysis ---');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
