const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const supabase = require('./supabase');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/check-symptoms', async (req, res) => {
    console.log('--- Start Health Chat ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Payload:', JSON.stringify(req.body, null, 2));

    try {
        const { message, symptoms, duration, severity } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is missing from environment variables');
        }

        if (!message && (!symptoms || symptoms.length === 0)) {
            return res.status(400).json({ error: 'Please provide a message or select symptoms.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const hasSymptoms = symptoms && symptoms.length > 0;
        const hasMessage = message && message.trim().length > 0;

        let prompt;

        if (hasMessage && !hasSymptoms) {
            // Free-text health question mode
            prompt = `
                You are MediEase, a friendly healthcare assistant chatbot. 
                The user asked a health-related question. Give a clear, helpful, and simple reply.

                STRICT RULES:
                - Maximum 120 words total.
                - Use very simple words. No medical jargon.
                - Use short sentences.
                - Be warm and conversational like a helpful friend.
                - If the question is NOT health-related, politely say you can only help with health topics.
                - No disclaimers inside the response.

                User's question: "${message.trim()}"

                Reply naturally. Use markdown headers (###) and bullet points (-) to organize if needed.
            `;
        } else {
            // Symptom analysis mode (with optional message context)
            prompt = `
                You are MediEase, a friendly healthcare assistant. Explain symptoms in very easy language.
                
                STRICT RULES:
                - Maximum 100 words total.
                - Use very simple words. No medical jargon.
                - Use short sentences.
                - No medical disclaimer.

                ${hasMessage ? `User's description: "${message.trim()}"` : ''}
                ${hasSymptoms ? `Selected symptoms: ${symptoms.join(', ')}` : ''}
                ${duration ? `Duration: ${duration}` : ''}
                ${severity ? `Severity: ${severity}/10` : ''}

                USE THIS EXACT STRUCTURE:

                ### Possible Issue
                One short sentence explaining the likely issue.

                ### What It Means
                One short sentence explaining what might be happening.

                ### What You Can Do
                - 3–4 short bullet points of simple home care.

                ### See a Doctor If
                - 2–3 warning signs.
            `;
        }

        console.log('Calling Gemini API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('AI response generated successfully. Length:', text.length);

        res.json({ analysis: text });
    } catch (error) {
        console.error('--- ERROR IN HEALTH CHAT ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);

        res.status(500).json({
            error: 'Failed to get response.',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        console.log('--- End Health Chat ---');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
